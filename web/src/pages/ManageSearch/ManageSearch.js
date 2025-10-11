import React, { useState } from 'react';
import { Layout } from '../Layout/Layout';
import { FormHistoryTable } from '../../components/FormHistoryTable/FormHistoryTable';



export const ManageSearch = () => {
  // const [isLoading, setIsLoading] = useState(false);

  return (
    <Layout page="mangeSearches">
      <FormHistoryTable page="mangeSearches"/>
    </Layout>
  );
};

