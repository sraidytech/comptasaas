import { User } from '../../users/entities';

// This interface is used by the service
export interface PaginatedUsers {
  users: User[];
  total: number;
}

// This interface is used by the controller
export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
