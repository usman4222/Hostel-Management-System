import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';
import Spinner from '../Spinner';

const AddMining = () => {
    const [miningRate, setMiningRate] = useState(0); // Initialize with 0 or any default value
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [existingRateId, setExistingRateId] = useState(null);

    useEffect(() => {
        const fetchMiningRate = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'miningRate'));
                if (!querySnapshot.empty) {
                    const rateDoc = querySnapshot.docs[0];
                    setMiningRate(rateDoc.data().rate);
                    setExistingRateId(rateDoc.id); 
                }
            } catch (error) {
                console.error('Error fetching mining rate:', error);
            }
        };

        fetchMiningRate();
    }, []);

    const handleAddOrUpdateRate = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            const formattedRate = parseFloat(miningRate.toFixed(5));
    
            if (existingRateId) {
                const rateDocRef = doc(db, 'miningRate', existingRateId);
                await updateDoc(rateDocRef, {
                    rate: formattedRate,
                });
                enqueueSnackbar('Mining Rate updated successfully!', { variant: 'success' });
            } else {
                await addDoc(collection(db, 'miningRate'), {
                    rate: formattedRate,
                });
                enqueueSnackbar('Mining Rate added successfully!', { variant: 'success' });
            }
    
            // Reset input and loading state
            setMiningRate(0);
            setLoading(false);
        } catch (error) {
            console.error('Error adding/updating mining rate:', error);
            setLoading(false);
        }
    };
    
    

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add Mining Rate" />

            <div className="flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="rounded-sm md:w-[500px] border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Mining Rate Form
                            </h3>
                        </div>
                        <form onSubmit={handleAddOrUpdateRate}>
                            <div className="p-6.5">
                                <div className="w-full pb-5">
                                    <label className="mb-2.5 mt-4 block text-black dark:text-white">
                                        Rate (per hour)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001" // Adjust step for decimal precision
                                        onChange={(e) => setMiningRate(parseFloat(e.target.value))}
                                        value={miningRate}
                                        required
                                        placeholder='Enter Mining Rate'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <button
                                    type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                    disabled={loading} 
                                >
                                    {loading ? <Spinner /> : existingRateId ? 'Update' : 'Add'} 
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default AddMining;
