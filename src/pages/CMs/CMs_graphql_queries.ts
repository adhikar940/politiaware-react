import { gql } from '@apollo/client';

export const GET_ALL_CMS_Table = gql`
  query {
    allCmsTable (ispresent: true) {
      Name
      State
      Party
      Gender
      CasteCategory
      Religion
    }
  }
`;

export const GET_CMS_Count = gql`
  query {
    cmCounts(ispresent: true) {
    CasteCategory
    Gender
    Party
    PartyColor
    Religion
  }
  }
`;