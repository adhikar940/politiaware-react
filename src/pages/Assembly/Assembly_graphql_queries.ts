import { gql } from '@apollo/client';

export const GET_ALL_MLAS = gql`
  query GetAllMLAs {
    allMLAs(limit: 50, offset: 0) {
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
          assemblyConstituencyName
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

