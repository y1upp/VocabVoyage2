import PocketBase from 'pocketbase';

// Initialize PocketBase instance
const pb = new PocketBase('http://127.0.0.1:8090'); // Ensure the PocketBase server is running

// Define the expected error structure
interface PocketBaseError {
  response: {
    data: {
      message: string;
    };
  };
}

// Function to create a user in PocketBase
export const createUser = async (username: string, email: string, password: string) => {
  try {
    const data = {
      username,
      email,
      password,
      passwordConfirm: password, // Add passwordConfirm to match the password
    };

    // Make API call to create a new user in the 'users' collection
    const record = await pb.collection('users').create(data);
    return record;
  } catch (error) {
    // Check if the error is an instance of PocketBaseError
    if (error && (error as PocketBaseError).response?.data) {
      const typedError = error as PocketBaseError;
      console.error('Error creating user:', typedError.response.data.message);
    } else {
      console.error('Error creating user:', error);
    }
    throw error; // Handle error as necessary
  }
};

// Function to authenticate a user using email/username and password
export const loginUser = async (email: string, password: string) => {
  try {
    console.log("Attempting to login with:", { email, password });

    // Authenticate using email and password
    const authData = await pb.collection('users').authWithPassword(email, password);

    // Check if authentication was successful
    if (pb.authStore.isValid) {
      console.log("Authentication successful");

      // Ensure model is not null before accessing id
      if (pb.authStore.model) {
        console.log("User ID:", pb.authStore.model.id); // User ID
      } else {
        console.error("User model is null");
      }

      console.log("Auth Token:", pb.authStore.token); // JWT token
      return authData;
    } else {
      console.error("Authentication failed");
      throw new Error('Authentication failed');
    }
  } catch (error) {
    // Check if the error is an instance of PocketBaseError
    if (error && (error as PocketBaseError).response?.data) {
      const typedError = error as PocketBaseError;
      console.error('Login failed:', typedError.response.data.message);
    } else {
      console.error('Login failed:', error);
    }
    throw error; // Rethrow error for handling elsewhere
  }
};