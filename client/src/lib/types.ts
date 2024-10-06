export interface IUser {
  _id: string;
  email: string;
  password?: string;
  username: string;
  image?: string;
  bio?: string;
  phone: string;
  address?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IParking {
  _id: string;
  name: string;
  address: string;
  banner: string;
  description: string;
  hours: {
    start: string;
    end: string;
  };
  ratePerHour: number;
  totalSpots: number;
  availableSpots: number;
  tags: string[];
  slots: string[];
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface IDetailedParking {
  _id: string;
  name: string;
  address: string;
  banner: string;
  description: string;
  hours: {
    start: string;
    end: string;
  };
  ratePerHour: number;
  totalSpots: number;
  availableSpots: number;
  tags: string[];
  slots: ISlot[];
  createdAt: string;
  updatedAt: string;
}

export interface ISlot {
  _id: string;
  position: number;
  timing: {
    start: string;
    end: string;
    isReserved: boolean;
    reservedBy: string | null;
  }[];
  isAvailable: boolean;
  createdAt: string;
}

export interface IReservation {
  user: string;
  slot: ISlot;
  parking: IParking;
  reservationTime: {
    start: Date;
    end: Date;
  };
  status: "active" | "completed" | "upcoming";
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
