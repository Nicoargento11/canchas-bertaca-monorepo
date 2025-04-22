import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ClipboardList,
} from "lucide-react";
import { getProducts } from "@/services/product/product";
import { getReservesByDayFetch } from "@/services/reserves/reserves";
import { format } from "date-fns";
import { getCourtByName } from "@/services/courts/courts";
import { StatsOverview } from "../../_components/stockv2/statsOverview";
import { PaymentCourtMatrix } from "../../_components/stockv2/paymentCourtMatrix";
import { PaymentRegister } from "../../_components/stockv2/paymentRegister";
import { DirectSales } from "../../_components/stockv2/directSales";
import { SoccerSchoolPayments } from "../../_components/stockv2/soccerSchoolPayments";
import { InventoryQuickActions } from "../../_components/stockv2/inventoryQuickActions";
import { RecentTransactions } from "../../_components/stockv2/recentTransactions";
// import { getSoccerSchoolStudents } from "@/services/soccerSchool/soccerSchool";

// Componentes

const dashboardData = {
  dailyIncome: 125000,
  dailyExpenses: 32000,
  reservations: {
    total: 18,
    online: 12,
    manual: 6,
  },
  incomeByType: {
    courts: 90000,
    products: 18000,
    soccerSchool: 15000,
    others: 2000,
  },
  expensesByType: {
    maintenance: 10000,
    staff: 15000,
    supplies: 5000,
    others: 2000,
  },
  occupancyRate: 75,
  comparison: {
    incomeChange: 5, // % respecto a ayer
    reservationsChange: -2, // % respecto a ayer
  },
};
export default async function DashboardPage() {
  const today = new Date();
  const [reservesByDay, products, courts] = await Promise.all([
    getReservesByDayFetch(format(today, "yyyy-MM-dd")),
    getProducts(),
    getCourtByName("dimasf5"),

    // getSoccerSchoolStudents()
  ]);

  const activeProducts = products.filter((product) => product.isActive);

  return (
    <div className="w-full min-h-screen p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel</h1>
      </div>

      <StatsOverview data={dashboardData} />

      <PaymentCourtMatrix
        reservesByDay={reservesByDay || []}
        products={activeProducts}
        court={courts}
      />

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="payments">
            <DollarSign className="w-4 h-4 mr-2" /> Pagos
          </TabsTrigger>
          <TabsTrigger value="sales">
            <ShoppingCart className="w-4 h-4 mr-2" /> Ventas
          </TabsTrigger>
          <TabsTrigger value="school">
            <Users className="w-4 h-4 mr-2" /> Escuela
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="w-4 h-4 mr-2" /> Inventario
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <ClipboardList className="w-4 h-4 mr-2" /> Movimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <PaymentRegister court={courts} />
        </TabsContent>

        <TabsContent value="sales">
          <DirectSales products={activeProducts} />
        </TabsContent>

        <TabsContent value="school">
          <SoccerSchoolPayments />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryQuickActions products={products} />
        </TabsContent>

        <TabsContent value="transactions">
          <RecentTransactions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
