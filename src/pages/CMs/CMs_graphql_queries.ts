import { gql } from '@apollo/client';

export const GET_ALL_CMS = gql`
  query GetAllCms {
    allCms(limit: 50, offset: 0) {
      total
      offset
      limit
      data {
        id
        name
        gender
        religion
        HighestEducation
        University
        ispresent
        rulingstate {
          id
          Statename
          Status
        }
        rulingperiods {
          id
          startdate
          enddate
        }
        party {
          id
          partyname
          abbreviation
        }
      }
    }
  }
`;

// Backwards compatibility alias
export const GET_ALL_CMS_Table = GET_ALL_CMS;
export const GET_CMS_Count = GET_ALL_CMS;