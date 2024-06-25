import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { FaImage } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import Spinner from '../Spinner';

const AddBlog = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [link, setLink] = useState('');
    const [chosenImage, setChosenImage] = useState(null);
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const handleAddBlog = async (e) => {
        e.preventDefault();
        setLoading(true); 

        const today = new Date().toISOString().split('T')[0]; 

        try {
            const imageRef = await uploadImage();
            await addDoc(collection(db, 'blogs'), {
                title: title,
                link: link,
                date: today, 
                blogImage: imageRef,
            });
            enqueueSnackbar('Blog added successfully!', { variant: 'success' });
            console.log("Blog successfully written!");

            setTitle('');
            setLink('');
            setImage(null);
            setChosenImage(null);
            setLoading(false);

            navigate('/allblogs'); 
        } catch (error) {
            console.log(error.message, "Other errors");
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setChosenImage(file ? file.name : null);
    };

    const uploadImage = async () => {
        if (!image) return '';

        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        return getDownloadURL(storageRef);
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add New Blog" />

            <div className="flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="rounded-sm md:w-[500px] border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Blog Form
                            </h3>
                        </div>
                        <form onSubmit={handleAddBlog}>
                            <div className="p-6.5">
                                <div className="w-full">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setTitle(e.target.value)}
                                        value={title}
                                        required
                                        placeholder='Enter Your Title'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="mb-2.5 mt-4 block text-black dark:text-white">
                                        Link
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setLink(e.target.value)}
                                        value={link}
                                        required
                                        placeholder='Enter Blog Link'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div className="mb-10">
                                    <label className="mb-2.5 mt-4 block text-black dark:text-white">
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
                                    type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                    disabled={loading} 
                                >
                                    {loading ? <Spinner /> : 'Add'} 
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default AddBlog;
