import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function AttendanceChart({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border
      border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-base font-semibold text-gray-700
        dark:text-gray-200 mb-4">
        Weekly Attendance Overview
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="PRESENT" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ABSENT" fill="#EF4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="LATE" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AttendanceChart;