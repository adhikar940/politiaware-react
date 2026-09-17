import { gql } from '@apollo/client';

export const GET_ALL_MLCS = gql`
  query GetAllMLCs {
    allMLCs(limit: 50, offset: 0) {
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
        constituencyName
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

