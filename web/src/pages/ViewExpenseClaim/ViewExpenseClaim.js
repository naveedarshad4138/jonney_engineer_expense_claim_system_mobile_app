import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { Layout } from "../Layout/Layout";
import { Alert } from "../../components/Alert/Alert";

const expenseCategories = [
  "Fuel",
  "Car Park Charges",
  "Travel",
  "Materials",
  "Sundries",
  "Meals",
  "Tools",
  "Software Services",
  "Meter Parking",
  "Accommodation",
  "SM8",
  "Entertaining",
  "Training Fees",
  "Others",
];
export const  ViewExpenseClaim = () => { 
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const { fetchData, postData, status, setStatus, loading } = useApi();
  const [claimData, setClaimData] = useState(null); 
    // Reject or approve
const handleStatus = (id, status) => async (e) => {
        e.preventDefault();
        if(status==='Rejected' && !window.confirm("Are you sure you want to reject this claim?")) return;
        if(status==='Approved' && !window.confirm("Are you sure you want to approve this claim?")) return;
        if (status==='Rejected') {
          const res = await postData(`/form/expense/cancel/${id}`, { status: 'Rejected' },  'Rejected successfully', 'Failed');
          console.log(res)
            // await deleteData(`/form/${id}`, 'DELETE');
            navigate('/expense-history');
        }
    };
  useEffect(() => {
     if (id) {
       (async () => { 
        const res = await fetchData(`form/expense/${id}`);
         if (res?.results) { 
          setClaimData(res.results);
         } else {
           setStatus({ type: 'error', message: 'Failed to fetch claim data' }); } })(); 
          }
  }, [id]); 
  if (loading) return  <Layout page="singleexpense" data={claimData}><p>Loading...</p></Layout>; if (!claimData) return <Layout page="singleexpense" data={claimData}><p>No data found</p></Layout>; 
  const { generalInfo, jobs, total } = claimData;
            
  return (
    <Layout page="singleexpense" data={claimData}>
      {/* {status && <Alert data={status} />} */}
      <div className="mb-4 d-flex justify-content-end gap-2 text-end">
        {
          claimData.status == 'Pending' && (
            <>
              <button class='btn btn-success' onClick={handleStatus(claimData._id, 'Approved')}>Approve</button>
              <button class='btn btn-danger'onClick={handleStatus(claimData._id, 'Rejected')}>Cancel</button>
            </>
          )

        }
        {
          claimData.status != 'Pending' && 
              <button class={`btn btn-${claimData.status=='Rejected'?'danger':'success'}`} disabled>{claimData.status}</button>
        }
        
      </div>
    {/* <div className="container">
      

      <h2>Expense Claim Details</h2> */}

      <div className="infoSection">
        <p><b>From Date:</b> {generalInfo.fromDate}</p>
        <p><b>To Date:</b> {generalInfo.toDate}</p>
        <p><b>Name:</b> {generalInfo.name}</p>
        <p><b>Approved By:</b> {generalInfo.approvedBy}</p>
        <p><b>Notes:</b> {generalInfo.notes}</p>
      </div>
      <div className="tableWrapper">
        <table className="expenseTable">
          <thead>
            <tr>
              <th>Expense</th>
              {jobs.map((job, i) => (
                <th key={i}>{job.name || `Job ${i + 1}`}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {expenseCategories.map((category, idx) => {
              return (
                <tr key={category} className={idx % 2 === 1 ? "zebraRow" : ""}>
                  <td>{category}</td>
                  {jobs.map((job, j) => {
                  {console.log(jobs)}
                    const expense = job.expenses.find((e) => e.category === category) || {};
                    const amount = Number(expense.amount || 0).toFixed(2);
                    const receiptUri = expense.receiptUri ? (process.env.REACT_APP_API_BASE_URL + 'uploads/' + expense.receiptUri): false
                    const noReceiptReason = expense.noReceiptReason || "";

                    return (
                      <td key={j}>
                        <div>£{amount}</div>
                        {receiptUri && (
                          <img
                            className="receiptImg"
                            src={receiptUri}
                            alt={`${category} receipt`}
                          />
                        )}
                        {noReceiptReason && (
                          <div className="noReceiptReason">Reason: {noReceiptReason}</div>
                        )}
                        {/* {!receiptUri && !noReceiptReason && (
                          <div className="noAttachment">No attachment</div>
                        )} */}
                      </td>
                    );
                  })}
                  <td>£{Number(total.categoryTotals[idx] || 0).toFixed(2)}</td>
                </tr>
              );
            })}
            <tr className="totalsRow">
              <td><b>Total</b></td>
              {total.jobTotals.map((t, i) => (
                <td key={i}><b>£{Number(t).toFixed(2)}</b></td>
              ))}
              <td><b>£{Number(total.subtotal).toFixed(2)}</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      <style>{`
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
          background-color: #f9f9fb;
          max-width: 1000px;
          margin: auto;
        }
        .backBtn {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          margin-bottom: 15px;
          font-size: 16px;
        }
        h2 {
          font-weight: 700;
          margin-bottom: 20px;
          color: #222;
        }
        .infoSection p {
          margin: 6px 0;
          font-size: 14px;
        }
        .deleteBtn {
          background-color: #dc3545;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
          margin-bottom: 30px;
          font-weight: bold;
        }
        .deleteBtn:disabled {
          background-color: #a94442;
          cursor: not-allowed;
        }
        .tableWrapper {
          overflow-x: auto;
        }
        table.expenseTable {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        table.expenseTable th, table.expenseTable td {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: center;
          vertical-align: top;
          min-width: 120px;
        }
        table.expenseTable th {
          background-color: #f1f1f1;
          font-weight: 700;
        }
        .zebraRow {
          background-color: #fafafa;
        }
        .totalsRow {
          background-color: #ddd;
          font-weight: 700;
        }
        .receiptImg {
          margin-top: 6px;
          width: 80px;
          height: 80px;
          object-fit: contain;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .noReceiptReason {
          margin-top: 6px;
          font-style: italic;
          color: #d9534f;
        }
        .noAttachment {
          margin-top: 6px;
          font-style: italic;
          color: #999;
        }
      `}</style>
    
    </Layout>
  );
}
