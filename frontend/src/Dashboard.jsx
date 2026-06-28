import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";

function Dashboard() {
  const [data, setData] = useState({});

  const chartData = [
    { name: "Users", value: data.users ?? 0 },
    { name: "Workouts", value: data.workouts ?? 0 },
    { name: "Active", value: data.active ?? 0 },
  ];

  useEffect(() => {
    axios
      .get("http://localhost:5000/analytics")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <section className="dashboard">
      <h2>Admin Dashboard</h2>

      <div className="stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{data.users}</p>
        </div>

        <div className="stat-card">
          <h3>Total Workouts</h3>
          <p>{data.workouts}</p>
        </div>

        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{data.active}</p>
        </div>
      </div>

      <div className="chart-wrap">
        <BarChart width={400} height={300} data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#1f2937" />
        </BarChart>
      </div>
    </section>
  );
}

export default Dashboard;
