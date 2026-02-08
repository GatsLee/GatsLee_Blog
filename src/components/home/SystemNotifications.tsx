export default function SystemNotifications() {
  const notifications = [
    { time: "10:42:01", message: "Daily backup completed successfully (/dev/sdb1)" },
    { time: "09:15:33", message: "Docker image 'nginx:latest' updated" },
    { time: "03:00:00", message: "System cleanup routine executed" },
  ];

  return (
    <div className="bg-black border border-gray-800 p-6">
      <h3 className="text-lg font-bold text-white mb-4">SYSTEM NOTIFICATIONS</h3>
      <ul className="space-y-3 font-mono text-sm">
        {notifications.map((n, i) => (
          <li key={i} className="flex items-center text-gray-400">
            <span className="text-gray-600 mr-4">[{n.time}]</span>
            <span>{n.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
