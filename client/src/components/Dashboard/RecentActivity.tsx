export function RecentActivity() {
  // Mock data for recent activity
  const activities = [
    { type: "appointment", message: "Emma completed her appointment", color: "bg-green-500" },
    { type: "client", message: "New client Maria registered", color: "bg-blue-500" },
    { type: "inventory", message: "Product inventory updated", color: "bg-purple-500" },
    { type: "staff", message: "Staff schedule modified", color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center text-sm">
          <div className={`w-2 h-2 rounded-full mr-3 ${activity.color}`} />
          <span className="text-gray-600 dark:text-gray-400">{activity.message}</span>
        </div>
      ))}
    </div>
  );
}
