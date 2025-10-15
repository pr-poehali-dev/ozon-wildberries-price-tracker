import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const SettingsTab = () => {
  return (
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
  );
};

export default SettingsTab;
