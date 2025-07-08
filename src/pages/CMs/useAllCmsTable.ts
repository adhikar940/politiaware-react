import { useEffect, useState } from 'react';
import { fetchGraphQL } from '../../services/graphqlService';

export const useAllCmsTable= () => {
  const [cmsList, setCmsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const GET_ALL_CMS = `
  query MyQuery {
    allCmsTable(ispresent: true) {
      Name
      Party
      Gender
      Religion
      State
      CasteCategory
    }
  }
`;
  useEffect(() => {
    fetchGraphQL(GET_ALL_CMS)
      .then((res) => {
        setCmsList(res.allCmsTable || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  
  return { cmsList, loading };
};
