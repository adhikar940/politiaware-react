import { gql } from '@apollo/client';

export const GET_ALL_RAJYASABHA_MPS = gql`
  query GetAllRajyasabhaMPs {
    allRajyasabhaMPs(limit: 50, offset: 0) {
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
        elected
        nominationCategory
        isPresent
        state {
          id
          Statename
          Status
        }
        party {
          id
          partyname
          abbreviation
          partyColor
        }
      }
    }
  }
`;

