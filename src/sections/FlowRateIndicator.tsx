interface FlowRateIndicatorProps {
  flowRate: number | string;
}

const FlowRateIndicator = ({ flowRate }: FlowRateIndicatorProps) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-lg text-center">
      <h3 className="text-lg font-semibold">Flow Rate</h3>
      <p className="text-xl font-bold">{flowRate} L/min</p>
    </div>
  );
};

export default FlowRateIndicator;
