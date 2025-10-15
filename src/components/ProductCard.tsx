import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Product = {
  id: string;
  name: string;
  currentPrice: number;
  targetPrice: number;
  marketplace: 'ozon' | 'wildberries';
  imageUrl: string;
  articleNumber: string;
  priceHistory: { date: string; price: number }[];
  notifications: boolean;
  productUrl?: string;
};

interface ProductCardProps {
  product: Product;
  index: number;
  onToggleNotifications: (productId: string) => void;
  onDelete: (productId: string) => void;
}

const ProductCard = ({ product, index, onToggleNotifications, onDelete }: ProductCardProps) => {
  return (
    <Card 
      key={product.id} 
      className="overflow-hidden hover:shadow-lg transition-shadow" 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={product.marketplace === 'ozon' ? 'default' : 'secondary'}>
                {product.marketplace === 'ozon' ? 'Ozon' : 'Wildberries'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {product.articleNumber}
              </span>
            </div>
          </div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={product.priceHistory}>
              <defs>
                <linearGradient id={`gradient-${product.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill={`url(#gradient-${product.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Текущая цена</p>
            <p className="text-2xl font-bold text-primary">{product.currentPrice}₽</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Целевая цена</p>
            <p className="text-2xl font-bold text-secondary">{product.targetPrice}₽</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={product.notifications}
              onCheckedChange={() => onToggleNotifications(product.id)}
              id={`notifications-${product.id}`}
            />
            <Label htmlFor={`notifications-${product.id}`} className="text-sm">
              Уведомления
            </Label>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(product.productUrl || '#', '_blank')}
            >
              <Icon name="ExternalLink" size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDelete(product.id)}
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
