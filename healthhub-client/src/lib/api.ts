import {
  ApiResponse,
  LoginData,
  RegisterData,
  User,
  Doctor,
  Appointment,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async searchDoctors(
    query: string,
    location?: string,
  ): Promise<ApiResponse<Doctor[]>> {
    let endpoint = `/doctors/search?q=${encodeURIComponent(query)}`;
    if (location) {
      endpoint += `&location=${encodeURIComponent(location)}`;
    }
    return this.request(endpoint);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  // Auth endpoints
  async login(
    data: LoginData,
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async register(
    data: RegisterData,
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request("/auth/me");
  }

  // Doctor endpoints
  async getDoctors(): Promise<ApiResponse<Doctor[]>> {
    return this.request("/doctors");
  }

  async getDoctor(id: string): Promise<ApiResponse<Doctor>> {
    return this.request(`/doctors/${id}`);
  }

  async getDoctorByUserId(userId: string): Promise<ApiResponse<Doctor>> {
  return this.request(`/doctors/user/${userId}`);
}

  async getDoctorsBySpecialization(
    specialization: string,
  ): Promise<ApiResponse<Doctor[]>> {
    return this.request(`/doctors/specialization/${specialization}`);
  }
  async updateDoctor(id: string, data: any): Promise<any> {
    return this.request(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  // Appointment endpoints
  async createAppointment(
    data: Partial<Appointment>,
  ): Promise<ApiResponse<Appointment>> {
    return this.request("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMyAppointments(): Promise<ApiResponse<Appointment[]>> {
    return this.request("/appointments/my");
  }

  async getAppointment(id: string): Promise<any> {
    return this.request(`/appointments/${id}`);
  }

  async updateAppointment(id: string, data: any): Promise<any> {
    return this.request(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateAppointmentStatus(
    id: string,
    status: string,
  ): Promise<ApiResponse<Appointment>> {
    return this.request(`/appointments/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async cancelAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return this.request(`/appointments/${id}/cancel`, {
      method: "PUT",
    });
  }
}

export const api = new ApiService(API_URL);
