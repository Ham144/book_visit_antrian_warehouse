const QuickActionPanel = ({ isOpen, actions }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto">
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Reassign Booking
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Force Start
          </button>
          <button className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">
            Force Finish
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Add Note
          </button>
          {/* <div className="flex items-center ml-auto">
            <span className="text-sm mr-2">Auto Efficiency</span>
            <ToggleSwitch enabled={actions.autoEfficiencyEnabled} />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default QuickActionPanel;
