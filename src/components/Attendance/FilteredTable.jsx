import React from 'react'

const FilteredTable = () => {


    return (
        <div>
            <table className="w-full table-auto">
                <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Present</th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Absent</th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Leave</th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Total Days</th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Present Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    <tr >
                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                            <p className="text-black dark:text-white">9</p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                            <p className="text-black dark:text-white">9</p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                            <p className="text-black dark:text-white">9</p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                            <p className="text-black dark:text-white">9</p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                            <p className="text-black dark:text-white">9%</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default FilteredTable
