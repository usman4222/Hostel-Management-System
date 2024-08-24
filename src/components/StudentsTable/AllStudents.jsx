
import TableOne from '../../Tables/TableOne';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';


const AllEmployees = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Students Table" />
      <div className="flex flex-col gap-10">
        <TableOne />
      </div>
    </DefaultLayout>
  );
};

export default AllEmployees;
