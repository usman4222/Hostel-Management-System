import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, query, collection, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';
import Spinner from '../Spinner';

const UpdateExam = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [examTerm, setExamTerm] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
    const [obtainedMarks, setObtainedMarks] = useState('');
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [className, setClassName] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [studentName, setStudentName] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    console.log(subjectName);


    useEffect(() => {
        const fetchExam = async () => {
            try {
                const docRef = doc(db, 'exams', id); 
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const examData = docSnap.data();
                    setSelectedClass(examData.classId || '');
                    setSelectedStudent(examData.studentId || '');
                    setSelectedSubject(examData.subject || '');
                    setExamTerm(examData.examTerm || '');
                    setTotalMarks(examData.totalMarks || '');
                    setObtainedMarks(examData.obtainedMarks || '');
                    setSubjectName(examData.subjectName || '');

                    const classDoc = await getDoc(doc(db, 'classes', examData.classId));
                    if (classDoc.exists()) {
                        setClassName(classDoc.data().className);
                    } else {
                        console.error("Class document not found");
                    }

                    const studentDoc = await getDoc(doc(db, 'students', examData.studentId));
                    if (studentDoc.exists()) {
                        setStudentName(studentDoc.data().name);
                    } else {
                        console.error("Student document not found");
                    }

                } else {
                    console.error("No such exam!");
                }
            } catch (error) {
                console.error('Error fetching exam:', error);
            }
            setLoading(false);
        };

        fetchExam();
    }, [id]); 

    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedClass) return;

            try {
                const q = query(collection(db, 'students'), where('classId', '==', selectedClass));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log("No students found for this class.");
                } else {
                    const studentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setStudents(studentsList);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, [selectedClass]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const q = query(collection(db, 'classes'));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log("No classes found.");
                } else {
                    const classesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setClasses(classesList);
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };

        fetchClasses();
    }, []);


    useEffect(() => {
        const fetchSubjects = async () => {
            if (!selectedClass) return;

            try {
                const q = query(collection(db, 'classes'), where('__name__', '==', selectedClass));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log("No subjects found for this class.");
                } else {
                    const subjectsList = querySnapshot.docs.map(doc => doc.data().subjects || []);
                    console.log("Subjects fetched:", subjectsList.flat());
                    setSubjects(subjectsList.flat());
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
            }
        };

        fetchSubjects();
    }, [selectedClass]);

    // const handleClassChange = (e) => {
    //     const classId = e.target.value;
    //     setSelectedClass(classId);
    //     setClassName('');

    //     if (classId) {
    //         const selectedClassData = classes.find(cls => cls.id === classId);
    //         if (selectedClassData) {
    //             setClassName(selectedClassData.className);
    //         }
    //     }
    // };
    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);

        const selectedClassData = classes.find(cls => cls.id === classId);
        if (selectedClassData) {
            setClassName(selectedClassData.className); 
        } else {
            setClassName(''); 
        }
    };


    const handleStudentChange = (e) => {
        const studentId = e.target.value;
        setSelectedStudent(studentId);

        if (studentId) {
            const selectedStudentData = students.find(s => s.id === studentId);
            if (selectedStudentData) {
                setStudentName(selectedStudentData.name);
            }
        }
    };

    const handleSubjectChange = (e) => {
        const subjectId = e.target.value;
        setSelectedSubject(subjectId);

        // Find the selected subject details
        const selectedSubjectData = subjects.find(sub => sub.id === subjectId);
        if (selectedSubjectData) {
            setSubjectName(selectedSubjectData.subjectName); 
        }
    };



    const handleExamTermChange = (e) => {
        setExamTerm(e.target.value);
    };

    const handleTotalMarksChange = (e) => {
        setTotalMarks(e.target.value);
    };

    const handleObtainedMarksChange = (e) => {
        setObtainedMarks(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (!selectedClass || !selectedStudent || !selectedSubject || !examTerm || !totalMarks || !obtainedMarks) {
        //     console.error("All fields are required");
        //     return;
        // }

        setSubmitLoading(true);

        try {
            const docRef = doc(db, 'exams', id);
            await updateDoc(docRef, {
                classId: selectedClass,
                studentId: selectedStudent,
                subject: selectedSubject,
                examTerm: examTerm,
                totalMarks: parseFloat(totalMarks),
                obtainedMarks: parseFloat(obtainedMarks),
                className: className, 
                subjectName: subjectName, 
            });
            enqueueSnackbar("Exam updated successfully!", { variant: 'success' });
            navigate('/all-exams');
        } catch (error) {
            console.error("Error updating exam:", error);
            enqueueSnackbar("Error updating exam. Please try again.", { variant: 'error' });
        }

        setSubmitLoading(false);
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Update Exam" />
            <div className="flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="rounded-sm md:w-[500px] border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Update Exam
                            </h3>
                        </div>
                        {loading ? (
                            <div className="p-6.5 flex justify-center items-center">
                                <Spinner />
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="p-6.5">
                                    <div className="mb-4.5 ">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Exam Term
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <select
                                                required
                                                onChange={handleExamTermChange}
                                                value={examTerm}
                                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            >
                                                <option value="" disabled>
                                                    Select Exam Term
                                                </option>
                                                <option value="weekly">Weekly Exam</option>
                                                <option value="monthly">Monthly Exam</option>
                                                <option value="midterm">Mid Term</option>
                                                <option value="finalterm">Final Term</option>
                                            </select>
                                            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                                <svg
                                                    className="fill-current"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <g opacity="0.8">
                                                        <path
                                                            fillRule="evenodd"
                                                            clipRule="evenodd"
                                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                            fill=""
                                                        ></path>
                                                    </g>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Class Name
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <select
                                                required
                                                onChange={handleClassChange}
                                                value={selectedClass}
                                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            >
                                                <option value="" >
                                                    Select your class
                                                </option>
                                                {classes.length > 0 ? (
                                                    classes.map((cls, index) => (
                                                        <option key={index} value={cls.id}>
                                                            {cls.className}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="" disabled>
                                                        No classes available.
                                                    </option>
                                                )}
                                            </select>
                                            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                                <svg
                                                    className="fill-current"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <g opacity="0.8">
                                                        <path
                                                            fillRule="evenodd"
                                                            clipRule="evenodd"
                                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                            fill=""
                                                        ></path>
                                                    </g>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Student Name
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <select
                                                required
                                                onChange={handleStudentChange}
                                                value={selectedStudent}
                                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            >
                                                <option value="">
                                                    Select a student
                                                </option>
                                                {students.length > 0 ? (
                                                    students.map((student, index) => (
                                                        <option key={index} value={student.id}>
                                                            {student.name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="" disabled>
                                                        No students available.
                                                    </option>
                                                )}
                                            </select>
                                            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                                <svg
                                                    className="fill-current"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <g opacity="0.8">
                                                        <path
                                                            fillRule="evenodd"
                                                            clipRule="evenodd"
                                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                            fill=""
                                                        ></path>
                                                    </g>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Subject Name
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <select
                                                required
                                                onChange={handleSubjectChange}
                                                value={selectedSubject}
                                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            >
                                                <option value="">
                                                    Select a subject
                                                </option>
                                                {subjects.length > 0 ? (
                                                    subjects.map((subject, index) => (
                                                        <option key={index} value={subject.id}>
                                                             {subject}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="" disabled>
                                                        No subjects available.
                                                    </option>
                                                )}
                                            </select>
                                            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                                <svg
                                                    className="fill-current"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <g opacity="0.8">
                                                        <path
                                                            fillRule="evenodd"
                                                            clipRule="evenodd"
                                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                            fill=""
                                                        ></path>
                                                    </g>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Total Marks
                                        </label>
                                        <input
                                            type="number"
                                            value={totalMarks}
                                            onChange={handleTotalMarksChange}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Obtained Marks
                                        </label>
                                        <input
                                            type="number"
                                            value={obtainedMarks}
                                            onChange={handleObtainedMarksChange}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:shadow-1"
                                        disabled={submitLoading}
                                    >
                                        {submitLoading ? (
                                            <>
                                                <Spinner className="mr-2" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Exam'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default UpdateExam;
