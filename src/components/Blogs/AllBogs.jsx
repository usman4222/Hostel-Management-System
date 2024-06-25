import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { ImEye } from "react-icons/im";
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import '@firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';

const AllBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const fetchBlogs = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'blogs'));
            const blogsList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            blogsList.forEach(blog => console.log(blog.date));
            blogsList.sort((a, b) => new Date(b.date) - new Date(a.date));
            setBlogs(blogsList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching blogs: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const deleteUserHandler = async (userId) => {
        try {
            await deleteDoc(doc(db, 'blogs', userId));
            enqueueSnackbar('Blog deleted successfully', { variant: 'success' });
            console.log(`Blog with ID ${userId} deleted successfully`);
            fetchBlogs(); 
        } catch (error) {
            console.error('Error deleting user or updating referrals: ', error);
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Blogs Table" />
            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="max-w-full overflow-x-auto">
                        <div className='flex flex-col justify-between md:flex-row'>
                            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                                All Blogs
                            </h4>
                        </div>
                        {loading ? (
                            <div className='border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark'>
                                <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                                    Loading...
                                </h4>
                            </div>
                        ) : blogs.length === 0 ? (
                            <div className='border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark'>
                                <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                                    No Blogs Available
                                </h4>
                            </div>
                        ) : (
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Image</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Title</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Link</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Date</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blogs.map((blog) => (
                                        <tr key={blog.id}>
                                            <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                                <img src={blog.blogImage} alt={blog.title} className="h-20 w-20 object-cover rounded-lg" />
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{blog.title}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{blog.link}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{new Date(blog.date).toLocaleDateString()}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <div className="flex items-center space-x-3.5">
                                                    <button className="hover:text-primary" onClick={() => deleteUserHandler(blog.id)}>
                                                        <MdDeleteForever />
                                                    </button>
                                                    <Link to={`/update-blog/${blog.id}`}>
                                                        <button className="hover:text-primary">
                                                            <MdEdit />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default AllBlogs;
