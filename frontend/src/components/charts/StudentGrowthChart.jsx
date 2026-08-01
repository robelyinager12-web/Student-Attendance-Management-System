import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

function StudentGrowthChart({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border
      border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-base font-semibold text-gray-700
        dark:text-gray-200 mb-4">
        Student Enrollment Growth
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#4F46E5"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StudentGrowthChart;