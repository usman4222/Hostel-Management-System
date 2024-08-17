import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { FaImage } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import Spinner from '../Spinner';

const UpdateBlog = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [initialState, setInitialState] = useState({});
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [image, setImage] = useState(null);
    const [link, setLink] = useState('');
    const [chosenImage, setChosenImage] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [submitLoading, setSubmitLoading] = useState(false); 
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const docRef = doc(db, 'blogs', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const blogData = docSnap.data();
                    setTitle(blogData.title);
                    setLink(blogData.link);
                    setDate(blogData.date);
                    setInitialState({
                        title: blogData.title,
                        link: blogData.link,
                        date: blogData.date,
                    });
                } else {
                    console.log('No such document!');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blog:', error);
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    const handleUpdateBlog = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            let updatedFields = {};
            let imageRef = null;

            if (title !== initialState.title) {
                updatedFields.title = title;
            }
            if (link !== initialState.link) {
                updatedFields.link = link;
            }
            if (date !== initialState.date) {
                updatedFields.date = date;
            }
            if (image) {
                imageRef = await uploadImage();
                updatedFields.blogImage = imageRef || null;
            }

            const blogRef = doc(db, 'blogs', id);
            await updateDoc(blogRef, updatedFields);
            enqueueSnackbar('Blog successfully updated!', { variant: 'success' });
            console.log("Blog successfully updated!");
            navigate('/allblogs');
        } catch (error) {
            console.error("Error updating blog:", error.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setChosenImage(file ? file.name : null);
    };

    const uploadImage = async () => {
        if (!image) return null;

        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        return getDownloadURL(storageRef);
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Update Blog" />

            <div className="flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Blog Form
                            </h3>
                        </div>
                        <form onSubmit={handleUpdateBlog}>
                            <div className="p-6.5">
                                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                            placeholder="Enter Your Title"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>

                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Link
                                        </label>
                                        <input
                                            type="text"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            required
                                            placeholder="Enter Blog Link"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Blog Image
                                    </label>
                                    <div className="flex items-center">
                                        <label className="w-full flex gap-3 items-center rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 focus-within:ring-2 text-white cursor-pointer focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary hover:ring-1 hover:ring-[#363636]/30 transition-all ease-in-out">
                                            <FaImage className="text-xl mb-1 text-[#5F5F5F]" />
                                            <span className="text-[#5F5F5F]">
                                                {chosenImage || 'Choose an image...'}
                                            </span>
                                            <input
                                                type="file"
                                                className="opacity-0 w-0 h-0"
                                                onClick={(e) => e.target.value = null}
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center items-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                >
                                    {submitLoading ? <Spinner /> : 'Update Blog'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default UpdateBlog;
