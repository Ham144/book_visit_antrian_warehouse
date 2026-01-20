const SparklineChart = ({ data, title, color = "blue" }) => {
  const maxValue = Math.max(...data?.map((d) => d.value));
  const minValue = Math.min(...data?.map((d) => d.value));
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <div className="flex items-end h-20 space-x-1">
        {data.map((point, i) => {
          const height =
            ((point.value - minValue) / (maxValue - minValue)) * 100;
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className={`w-full bg-${color}-500 rounded-t`}
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-gray-500 mt-1">
                {point.time.split(":")[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SparklineChart;
