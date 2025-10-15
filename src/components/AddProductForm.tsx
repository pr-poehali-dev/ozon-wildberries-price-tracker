import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

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
};

interface AddProductFormProps {
  newProductUrl: string;
  setNewProductUrl: (url: string) => void;
  parsing: boolean;
  parsedProduct: Partial<Product> | null;
  targetPrice: string;
  setTargetPrice: (price: string) => void;
  onParse: () => void;
  onAdd: () => void;
}

const AddProductForm = ({
  newProductUrl,
  setNewProductUrl,
  parsing,
  parsedProduct,
  targetPrice,
  setTargetPrice,
  onParse,
  onAdd,
}: AddProductFormProps) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Добавить товар для отслеживания</CardTitle>
        <CardDescription>
          Вставьте ссылку на товар из Ozon или Wildberries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="product-url">Ссылка на товар</Label>
          <div className="flex gap-2">
            <Input
              id="product-url"
              placeholder="https://www.ozon.ru/product/..."
              value={newProductUrl}
              onChange={(e) => setNewProductUrl(e.target.value)}
              disabled={parsing}
            />
            <Button 
              onClick={onParse}
              disabled={!newProductUrl.trim() || parsing}
            >
              {parsing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Поиск...
                </>
              ) : (
                <>
                  <Icon name="Search" size={16} className="mr-2" />
                  Найти
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Поддерживаются ссылки с Ozon.ru и Wildberries.ru
          </p>
        </div>

        {parsedProduct && (
          <div className="p-4 rounded-lg border bg-gradient-card space-y-4 animate-fade-in">
            <div className="flex items-start gap-4">
              <img
                src={parsedProduct.imageUrl}
                alt={parsedProduct.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{parsedProduct.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={parsedProduct.marketplace === 'ozon' ? 'default' : 'secondary'}>
                    {parsedProduct.marketplace === 'ozon' ? 'Ozon' : 'Wildberries'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Артикул: {parsedProduct.articleNumber}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {parsedProduct.currentPrice}₽
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="target-price">Целевая цена (₽)</Label>
              <Input
                id="target-price"
                type="number"
                placeholder="Например: 1999"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Вы получите уведомление, когда цена опустится до этого значения
              </p>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={onAdd}
              disabled={!targetPrice}
            >
              <Icon name="Plus" size={20} className="mr-2" />
              Начать отслеживание
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddProductForm;
