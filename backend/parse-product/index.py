import json
import re
from typing import Dict, Any
from urllib.parse import urlparse, parse_qs
import urllib.request

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Парсинг информации о товаре с Ozon и Wildberries по ссылке
    Args: event - dict с httpMethod, body (url товара)
          context - object с атрибутами request_id, function_name
    Returns: HTTP response dict с данными о товаре
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    url = body_data.get('url', '')
    
    if not url:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'URL is required'})
        }
    
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.lower()
    
    if 'ozon.ru' in domain:
        product_data = parse_ozon(url)
    elif 'wildberries.ru' in domain or 'wb.ru' in domain:
        product_data = parse_wildberries(url)
    else:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Unsupported marketplace. Only Ozon and Wildberries are supported.'})
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(product_data)
    }

def parse_ozon(url: str) -> Dict[str, Any]:
    article_match = re.search(r'/product/[^/]+-(\d+)', url)
    article_number = article_match.group(1) if article_match else 'unknown'
    
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response = urllib.request.urlopen(req, timeout=10)
        html = response.read().decode('utf-8')
        
        title_match = re.search(r'<title>([^<]+)</title>', html)
        name = title_match.group(1).strip() if title_match else f'Товар Ozon {article_number}'
        name = name.replace(' — купить на OZON', '').replace(' | OZON', '').strip()
        
        price_match = re.search(r'"price"[:\s]*(\d+)', html)
        if not price_match:
            price_match = re.search(r'(\d+)\s*₽', html)
        price = int(price_match.group(1)) if price_match else 0
        
        image_match = re.search(r'"(https://cdn[^"]*ozon[^"]*\.(?:jpg|jpeg|png|webp))"', html)
        if not image_match:
            image_match = re.search(r'(https://[^"]*cloudfront[^"]*\.(?:jpg|jpeg|png|webp))', html)
        image_url = image_match.group(1) if image_match else 'https://v3b.fal.media/files/b/tiger/VE2W3iEsEdBTX4cu_Tmko_output.png'
        
    except Exception:
        name = f'Товар Ozon {article_number}'
        price = 0
        image_url = 'https://v3b.fal.media/files/b/tiger/VE2W3iEsEdBTX4cu_Tmko_output.png'
    
    return {
        'name': name[:500],
        'articleNumber': article_number,
        'marketplace': 'ozon',
        'currentPrice': price,
        'imageUrl': image_url,
        'productUrl': url
    }

def parse_wildberries(url: str) -> Dict[str, Any]:
    article_match = re.search(r'/catalog/(\d+)/', url)
    article_number = article_match.group(1) if article_match else 'unknown'
    
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response = urllib.request.urlopen(req, timeout=10)
        html = response.read().decode('utf-8')
        
        title_match = re.search(r'<title>([^<]+)</title>', html)
        name = title_match.group(1).strip() if title_match else f'Товар Wildberries {article_number}'
        name = name.replace(' купить в интернет магазине Wildberries', '').replace(' / Wildberries', '').strip()
        
        price_match = re.search(r'"price"[:\s]*(\d+)', html)
        if not price_match:
            price_match = re.search(r'(\d+)\s*₽', html)
        price = int(price_match.group(1)) if price_match else 0
        
        image_match = re.search(r'"(https://[^"]*basket[^"]*\.wbbasket\.ru[^"]*\.(?:jpg|jpeg|png|webp))"', html)
        if not image_match:
            image_match = re.search(r'(https://[^"]*\.wbstatic\.net[^"]*\.(?:jpg|jpeg|png|webp))', html)
        image_url = image_match.group(1) if image_match else 'https://v3b.fal.media/files/b/tiger/VE2W3iEsEdBTX4cu_Tmko_output.png'
        
    except Exception:
        name = f'Товар Wildberries {article_number}'
        price = 0
        image_url = 'https://v3b.fal.media/files/b/tiger/VE2W3iEsEdBTX4cu_Tmko_output.png'
    
    return {
        'name': name[:500],
        'articleNumber': article_number,
        'marketplace': 'wildberries',
        'currentPrice': price,
        'imageUrl': image_url,
        'productUrl': url
    }
