import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ProductCard from '@/components/ProductCard';
import AddProductForm from '@/components/AddProductForm';
import SettingsTab from '@/components/SettingsTab';
import StatsCards from '@/components/StatsCards';

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
const PARSE_API_URL = 'https://functions.poehali.dev/2b9dd480-b184-4277-accb-e944ffd2df42';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('monitoring');
  const [newProductUrl, setNewProductUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [parsedProduct, setParsedProduct] = useState<Partial<Product> | null>(null);
  const [parsing, setParsing] = useState(false);
  const [targetPrice, setTargetPrice] = useState<string>('');

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

  const parseProductUrl = async () => {
    if (!newProductUrl.trim()) return;

    setParsing(true);
    try {
      const response = await fetch(PARSE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newProductUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse product');
      }

      const data = await response.json();
      setParsedProduct(data);
      setTargetPrice(String(Math.round(data.currentPrice * 0.9)));
    } catch (error) {
      console.error('Failed to parse product:', error);
      alert('Не удалось получить данные о товаре. Проверьте ссылку.');
    } finally {
      setParsing(false);
    }
  };

  const addNewProduct = async () => {
    if (!parsedProduct) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsedProduct,
          targetPrice: parseInt(targetPrice) || parsedProduct.currentPrice,
          notifications: true,
        }),
      });

      if (response.ok) {
        await loadProducts();
        setNewProductUrl('');
        setParsedProduct(null);
        setTargetPrice('');
        setActiveTab('monitoring');
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Не удалось добавить товар');
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
        <StatsCards
          totalProducts={products.length}
          averageSavings={products.length > 0 ? Math.round(totalSavings / products.length) : 0}
          activeNotifications={products.filter((p) => p.notifications).length}
        />

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
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onToggleNotifications={toggleNotifications}
                    onDelete={deleteProduct}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="animate-scale-in">
            <AddProductForm
              newProductUrl={newProductUrl}
              setNewProductUrl={setNewProductUrl}
              parsing={parsing}
              parsedProduct={parsedProduct}
              targetPrice={targetPrice}
              setTargetPrice={setTargetPrice}
              onParse={parseProductUrl}
              onAdd={addNewProduct}
            />
          </TabsContent>

          <TabsContent value="settings" className="animate-scale-in">
            <SettingsTab />
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
