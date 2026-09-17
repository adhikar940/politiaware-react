import { gql } from '@apollo/client';

export const GET_ALL_LOKSABHA_MPS = gql`
  query GetAllLokSabhaMPs {
    allLokSabhaMPs(limit: 50, offset: 0) {
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
        isPresent
        constituency {
          id
          loksabhaConstituencyName
          reservationCategory
          state {
            id
            Statename
            Status
          }
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

