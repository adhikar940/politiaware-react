import { gql } from '@apollo/client';

export const GET_ALL_GOVERNORS = gql`
  query GetAllGovernors {
    allGovernors(limit: 50, offset: 0) {
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
        birthCity {
          id
          cityName
          state {
            id
            Statename
          }
        }
      }
    }
  }
`;

