import React, { useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';

const FetchedClasses = ({ setClasses }) => {
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const q = query(collection(db, 'classes'));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log('No classes found');
                    return;
                }

                const classesList = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const subjects = data.subjects || []; 

                    console.log(`Class ID: ${doc.id}, Subjects:`, subjects); 

                    return {
                        id: doc.id, 
                        className: data.className || 'No name',
                        subjects: subjects
                    };
                });

                console.log('Fetched classes:', classesList);
                setClasses(classesList);  
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };

        fetchClasses();
    }, [setClasses]);

    return null;  
};

export default FetchedClasses;
