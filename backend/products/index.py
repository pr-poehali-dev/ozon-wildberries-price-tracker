import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления отслеживаемыми товарами
    Args: event - dict с httpMethod, body, queryStringParameters
          context - object с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    
    try:
        if method == 'GET':
            return get_products(conn)
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            return add_product(conn, body_data)
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            return update_product(conn, body_data)
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            product_id = params.get('id')
            return delete_product(conn, product_id)
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'})
            }
    finally:
        conn.close()

def get_products(conn) -> Dict[str, Any]:
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            p.id, 
            p.name, 
            p.article_number, 
            p.marketplace, 
            p.product_url,
            p.current_price, 
            p.target_price, 
            p.image_url, 
            p.notifications_enabled,
            p.created_at
        FROM products p
        ORDER BY p.created_at DESC
    ''')
    
    products = cursor.fetchall()
    
    result = []
    for product in products:
        cursor.execute('''
            SELECT price, checked_at 
            FROM price_history 
            WHERE product_id = %s 
            ORDER BY checked_at DESC 
            LIMIT 30
        ''', (product['id'],))
        
        price_history = cursor.fetchall()
        
        result.append({
            'id': str(product['id']),
            'name': product['name'],
            'articleNumber': product['article_number'],
            'marketplace': product['marketplace'],
            'productUrl': product['product_url'],
            'currentPrice': product['current_price'],
            'targetPrice': product['target_price'],
            'imageUrl': product['image_url'],
            'notifications': product['notifications_enabled'],
            'priceHistory': [
                {
                    'date': ph['checked_at'].strftime('%d.%m'),
                    'price': ph['price']
                }
                for ph in reversed(price_history)
            ]
        })
    
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'products': result})
    }

def add_product(conn, data: Dict[str, Any]) -> Dict[str, Any]:
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO products 
        (name, article_number, marketplace, product_url, current_price, target_price, image_url, notifications_enabled)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    ''', (
        data.get('name'),
        data.get('articleNumber'),
        data.get('marketplace'),
        data.get('productUrl'),
        data.get('currentPrice'),
        data.get('targetPrice'),
        data.get('imageUrl'),
        data.get('notifications', True)
    ))
    
    product_id = cursor.fetchone()['id']
    
    cursor.execute('''
        INSERT INTO price_history (product_id, price, checked_at)
        VALUES (%s, %s, %s)
    ''', (product_id, data.get('currentPrice'), datetime.now()))
    
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 201,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'id': product_id, 'success': True})
    }

def update_product(conn, data: Dict[str, Any]) -> Dict[str, Any]:
    cursor = conn.cursor()
    
    product_id = data.get('id')
    
    cursor.execute('''
        UPDATE products 
        SET notifications_enabled = %s,
            target_price = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    ''', (
        data.get('notifications'),
        data.get('targetPrice'),
        product_id
    ))
    
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'success': True})
    }

def delete_product(conn, product_id: str) -> Dict[str, Any]:
    if not product_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Product ID is required'})
        }
    
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM price_history WHERE product_id = %s', (product_id,))
    cursor.execute('DELETE FROM products WHERE id = %s', (product_id,))
    
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'success': True})
    }
