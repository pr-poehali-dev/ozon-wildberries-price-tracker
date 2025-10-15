import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface StatsCardsProps {
  totalProducts: number;
  averageSavings: number;
  activeNotifications: number;
}

const StatsCards = ({ totalProducts, averageSavings, activeNotifications }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <Icon name="Package" size={16} />
            Отслеживается товаров
          </CardDescription>
          <CardTitle className="text-4xl font-bold">{totalProducts}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-l-4 border-l-secondary">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <Icon name="TrendingDown" size={16} />
            Средняя экономия
          </CardDescription>
          <CardTitle className="text-4xl font-bold">{averageSavings}₽</CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-l-4 border-l-accent">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <Icon name="BellRing" size={16} />
            Активных уведомлений
          </CardDescription>
          <CardTitle className="text-4xl font-bold">{activeNotifications}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default StatsCards;
