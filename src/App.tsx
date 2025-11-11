import { Box, Container, Heading, Text } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Box as="header" bg="white" boxShadow="sm" py={4} mb={8}>
        <Container maxW="container.xl">
          <Heading as="h1" size="lg" color="brand.500">
            MOPH Portal Dashboard
          </Heading>
        </Container>
      </Box>

      <Box as="main" flex={1}>
        <Container maxW="container.xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Container>
      </Box>

      <Box as="footer" bg="gray.100" mt={8} py={4}>
        <Container maxW="container.xl" textAlign="center">
          <Text color="gray.600">© {new Date().getFullYear()} MOPH Portal. All rights reserved.</Text>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
