import { useState, ReactNode } from 'react';
// @ts-expect-error - @syncfusion/ej2-react-schedule is not installed; this file is pre-existing dead code
import { ScheduleComponent, ViewsDirective, ViewDirective, Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';
// @ts-expect-error - @syncfusion/ej2-react-calendars is not installed; this file is pre-existing dead code
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
// @ts-expect-error - src/data/dummy does not exist; this file is pre-existing dead code
import { scheduleData } from '../data/dummy';
// @ts-expect-error - Header is not exported from src/components; this file is pre-existing dead code
import { Header } from '../components';

// eslint-disable-next-line react/destructuring-assignment
const PropertyPane = (props: { children: ReactNode }) => <div className="mt-5">{props.children}</div>;

const Scheduler = () => {
  const [scheduleObj, setScheduleObj] = useState<any>();

  const change = (args: any) => {
    scheduleObj.selectedDate = args.value;
    scheduleObj.dataBind();
  };

  const onDragStart = (arg: any) => {
    // eslint-disable-next-line no-param-reassign
    arg.navigation.enable = true;
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Calendar" />
      <ScheduleComponent
        height="650px"
        ref={(schedule: any) => setScheduleObj(schedule)}
        selectedDate={new Date(2021, 0, 10)}
        eventSettings={{ dataSource: scheduleData }}
        dragStart={onDragStart}
      >
        <ViewsDirective>
          { ['Day', 'Week', 'WorkWeek', 'Month', 'Agenda'].map((item) => <ViewDirective key={item} option={item} />)}
        </ViewsDirective>
        <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
      </ScheduleComponent>
      <PropertyPane>
        <table
          style={{ width: '100%', background: 'white' }}
        >
          <tbody>
            <tr style={{ height: '50px' }}>
              <td style={{ width: '100%' }}>
                <DatePickerComponent
                  value={new Date(2021, 0, 10)}
                  showClearButton={false}
                  placeholder="Current Date"
                  floatLabelType="Always"
                  change={change}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </PropertyPane>
    </div>
  );
};

export default Scheduler;
