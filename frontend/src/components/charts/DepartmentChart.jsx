import {
  PieChart, Pie, Cell, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function DepartmentChart({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border
      border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-base font-semibold text-gray-700
        dark:text-gray-200 mb-4">
        Students by Department
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="studentCount"
            nameKey="department"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DepartmentChart;