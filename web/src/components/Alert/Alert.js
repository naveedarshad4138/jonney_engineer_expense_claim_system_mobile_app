import './Alert.css';

export const Alert = (data) => {
  return (
    <>
    {
      data!==null &&  <div className={`alert ${data?.data?.type ?'alert-success' : 'alert-error'}`}>
         {data?.data?.type ?'✅' : '❌'} {data?.data?.message }</div>
    }
     
          
  
  </>
  )
}
