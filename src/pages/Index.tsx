import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

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

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Беспроводные наушники TWS',
    currentPrice: 2499,
    targetPrice: 1999,
    marketplace: 'ozon',
    imageUrl: 'https://v3b.fal.media/files/b/tiger/VE2W3iEsEdBTX4cu_Tmko_output.png',
    articleNumber: '123456789',
    priceHistory: [
      { date: '01.10', price: 2899 },
      { date: '05.10', price: 2699 },
      { date: '10.10', price: 2499 },
      { date: '15.10', price: 2499 },
    ],
    notifications: true,
  },
  {
    id: '2',
    name: 'Смарт-часы Xiaomi',
    currentPrice: 4999,
    targetPrice: 4500,
    marketplace: 'wildberries',
    imageUrl: 'https://v3b.fal.media/files/b/tiger/VE2W3iEsEdBTX4cu_Tmko_output.png',
    articleNumber: '987654321',
    priceHistory: [
      { date: '01.10', price: 5499 },
      { date: '05.10', price: 5299 },
      { date: '10.10', price: 4999 },
      { date: '15.10', price: 4999 },
    ],
    notifications: true,
  },
  {
    id: '3',
    name: 'Фитнес-браслет Mi Band',
    currentPrice: 1799,
    targetPrice: 1500,
    marketplace: 'ozon',
    imageUrl: 'https://v3b.fal.media/files/b/tiger/VE2W3iEsEdBTX4cu_Tmko_output.png',
    articleNumber: '456789123',
    priceHistory: [
      { date: '01.10', price: 1999 },
      { date: '05.10', price: 1899 },
      { date: '10.10', price: 1799 },
      { date: '15.10', price: 1799 },
    ],
    notifications: false,
  },
];

const API_URL = 'https://functions.poehali.dev/bd2b6eb3-337d-489e-b770-e35c781f5e19';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('monitoring');
  const [newProductUrl, setNewProductUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedNotifications = !product.notifications;

    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, notifications: updatedNotifications } : p
      )
    );

    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          notifications: updatedNotifications,
          targetPrice: product.targetPrice,
        }),
      });
    } catch (error) {
      console.error('Failed to update notifications:', error);
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, notifications: product.notifications } : p
        )
      );
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await fetch(`${API_URL}?id=${productId}`, {
        method: 'DELETE',
      });
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const totalSavings = products.reduce(
    (acc, p) => acc + (p.currentPrice < p.targetPrice ? 0 : p.targetPrice - p.currentPrice),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-orange-teal flex items-center justify-center">
                <Icon name="TrendingDown" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">PriceTracker</h1>
                <p className="text-sm text-muted-foreground">Отслеживание цен на Ozon и Wildberries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon">
                <Icon name="Bell" size={20} />
              </Button>
              <Button variant="outline" size="icon">
                <Icon name="Settings" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Icon name="Package" size={16} />
                Отслеживается товаров
              </CardDescription>
              <CardTitle className="text-4xl font-bold">{products.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Icon name="TrendingDown" size={16} />
                Средняя экономия
              </CardDescription>
              <CardTitle className="text-4xl font-bold">
                {products.length > 0 ? Math.round(totalSavings / products.length) : 0}₽
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Icon name="BellRing" size={16} />
                Активных уведомлений
              </CardDescription>
              <CardTitle className="text-4xl font-bold">
                {products.filter((p) => p.notifications).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Icon name="LayoutGrid" size={16} />
              Мониторинг
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Icon name="Plus" size={16} />
              Добавить товар
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Icon name="Settings" size={16} />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-6 animate-scale-in">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Загрузка товаров...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Package" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Нет отслеживаемых товаров</h3>
                <p className="text-muted-foreground mb-6">
                  Добавьте первый товар для мониторинга цен
                </p>
                <Button onClick={() => setActiveTab('add')}>
                  <Icon name="Plus" size={20} className="mr-2" />
                  Добавить товар
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {products.map((product, index) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow" style={{ animationDelay: `${index * 100}ms` }}>
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
                          onCheckedChange={() => toggleNotifications(product.id)}
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
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="animate-scale-in">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Добавить товар для отслеживания</CardTitle>
                <CardDescription>
                  Вставьте ссылку на товар из Ozon или Wildberries, либо укажите артикул
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="product-url">Ссылка на товар или артикул</Label>
                  <Input
                    id="product-url"
                    placeholder="https://www.ozon.ru/product/... или 123456789"
                    value={newProductUrl}
                    onChange={(e) => setNewProductUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="target-price">Целевая цена (₽)</Label>
                  <Input
                    id="target-price"
                    type="number"
                    placeholder="Например: 1999"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Уведомления</Label>
                  <div className="space-y-3 pl-1">
                    <div className="flex items-center gap-2">
                      <Switch id="telegram" defaultChecked />
                      <Label htmlFor="telegram" className="flex items-center gap-2 font-normal">
                        <Icon name="Send" size={16} />
                        Telegram
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="email" defaultChecked />
                      <Label htmlFor="email" className="flex items-center gap-2 font-normal">
                        <Icon name="Mail" size={16} />
                        Email
                      </Label>
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Начать отслеживание
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-scale-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Send" size={20} />
                    Telegram бот
                  </CardTitle>
                  <CardDescription>
                    Настройте Telegram бот для мгновенных уведомлений
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-card border">
                    <p className="text-sm mb-2">Ваш Telegram ID:</p>
                    <code className="text-lg font-mono bg-muted px-3 py-1 rounded">@pricetracker_bot</code>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Icon name="Link" size={16} className="mr-2" />
                    Подключить бота
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Mail" size={20} />
                    Email уведомления
                  </CardTitle>
                  <CardDescription>
                    Получайте уведомления на почту
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-address">Email адрес</Label>
                    <Input
                      id="email-address"
                      type="email"
                      placeholder="your@email.com"
                      defaultValue="user@example.com"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="email-notifications" defaultChecked />
                    <Label htmlFor="email-notifications">Получать ежедневные отчеты</Label>
                  </div>
                  <Button variant="outline" className="w-full">
                    Сохранить настройки
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="LineChart" size={20} />
                    Частота проверки цен
                  </CardTitle>
                  <CardDescription>
                    Как часто проверять изменения цен на маркетплейсах
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col gap-1">
                      <Icon name="Clock" size={24} />
                      <span className="font-semibold">Каждый час</span>
                    </Button>
                    <Button variant="default" className="h-20 flex flex-col gap-1">
                      <Icon name="Clock" size={24} />
                      <span className="font-semibold">Каждые 4 часа</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-1">
                      <Icon name="Clock" size={24} />
                      <span className="font-semibold">Раз в день</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-16 border-t bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>PriceTracker © 2024 · Следим за ценами, экономим ваши деньги</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;