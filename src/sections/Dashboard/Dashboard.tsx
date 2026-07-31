import EDashboard from './EDashboard';
import WDashboard from './WDashboard';
import ADashboard from './ADashboard';

interface DashboardProps {
  activeBlock: string;
}

const Dashboard = ({ activeBlock }: DashboardProps) => {
  return (
    <>
      {activeBlock === 'Energy' && <EDashboard />}
      {activeBlock === 'Water' && <WDashboard />}
      {activeBlock === 'Air' && <ADashboard />}
    </>
  );
};

export default Dashboard;
