import orders from "../../../data/orders.json";

const handleOrdersSummary = (uuidList: string[]) => {
  const orderResponse = orders;
  const uuidSet = new Set(uuidList);

  const filteredOrders = orderResponse.filter(
    (order) => uuidSet.has(order.customer_id) && order.status === "shipped"
  );

  const customersMap: Record<
    string,
    { orderCount: number; totalSpent: number }
  > = {};

  for (const order of filteredOrders) {
    const id = order.customer_id;
    if (!customersMap[id]) {
      customersMap[id] = { orderCount: 0, totalSpent: 0 };
    }

    customersMap[id].orderCount += 1;

    for (const item of order.items) {
      customersMap[id].totalSpent += item.quantity * item.unit_price;
    }
  }

  const customers = [];
  for (const id of uuidList) {
    if (id in customersMap) {
      const { orderCount, totalSpent } = customersMap[id];
      customers.push({
        customer_id: id,
        order_count: orderCount,
        totalSpent: totalSpent.toFixed(2),
      });
    }
  }

  console.log({ customers });

  return JSON.stringify({ customers });
};

const OrdersPage = () => {
  handleOrdersSummary(["C123", "C456", "C789"]);
  return (
    <div className="page wrapper">
      <h1>Orders</h1>

      {JSON.stringify(orders, null, 2)}
    </div>
  );
};

export default OrdersPage;
