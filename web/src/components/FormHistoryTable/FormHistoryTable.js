import React, { useState, useEffect } from 'react'
import useApi from '../../hooks/useApi';
import { ApiHistoryResultsModal } from '../Modals/ApiHistoryResultsModal';
import { Link } from 'react-router-dom';

export const FormHistoryTable = ({page}) => {
     const [isModalOpen, setIsModalOpen] = useState(false);
    const { fetchData,deleteData, loading } = useApi(); 
    const [data, setData] = useState([]);
    const [historyResults, setHistoryResults] = useState([]);
  // Define your state here
const handleDelete = (id) => async (e) => {
        e.preventDefault();
        if (window.confirm("Are you sure you want to delete this record?")) {
            await deleteData(`/form/${id}`, 'DELETE');
            const updata= data?.results?.filter(record => record._id !== id);
            setData({results:updata});
        }
    };
// Fetch data on mount
  useEffect(() => {
   
    const loadData = async () => {
        let results;
    //      if(page === 'mangeSearches') {
    //    results = await fetchData('/form/all');
    // }
    if( page === 'mangeSearches') {

         results = await fetchData('/form/all');
    }
      setData(results);
    };
    loadData();
  }, []);
//   console.log(data?.results)
  if (loading) return <p>Loading...</p>;
    return (
        <div className="table-container">
            
            <table id="suvTable" className="table">
                <thead>
                    <tr>
                        <th>ID #</th>
                        <th>NAME</th>
                        <th>Note</th>
                        <th>Approved By</th>
                        <th>From date </th>
                        <th>To date </th>
                        <th>ACTION</th> 
                    </tr>
                </thead>
                <tbody>
                    {
                        data?.results?.length==0 && <tr><td colSpan={12} className='text-center'>No records found</td></tr>
                    }
                    {

                        data?.results?.map((record, key) => (
                            <tr key={key}>
                            <td>{key+1}</td>
                            <td>{record.generalInfo.name}</td>
                            <td>{record.generalInfo.notes}</td>
                            <td>{record.generalInfo.approvedBy}</td>
                            <td>{record.generalInfo.fromDate}</td>
                            <td>{record.generalInfo.toDate}</td>
                            <td class='d-flex'>
                            {page === 'mangeSearches' && (
                                    <button className="red-btn me-2" onClick={handleDelete(record._id)} style={{padding: "4px 6px"}}>
                                                <i className="material-icons" style={{ fontSize: 18 }}>delete</i>
                                            </button>
                                
                               
                            )}
                                <Link to={`/expense/${record._id}`}>
                                    <button className="red-btn" style={{padding: "4px 6px"}}>
                                                <i className="material-icons" style={{ fontSize: 18 }}>visibility</i>
                                            </button>
                                            </Link>
                                
                                </td>
                            </tr>
                        ))
                        }
                    
                </tbody>
            </table>

            <ApiHistoryResultsModal setIsModalOpen={setIsModalOpen} results={data} isOpen={isModalOpen} resultss={historyResults}/>
        </div>
       
    )
}
