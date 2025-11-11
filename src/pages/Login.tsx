import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text, useToast } from '@chakra-ui/react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: data.message || 'เข้าสู่ระบบสำเร็จ',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Store user data in local storage or context
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองอีกครั้ง',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={8} bg="white" borderRadius="md" boxShadow="md">
      <Heading as="h2" size="xl" mb={6} textAlign="center" color="brand.500">
        เข้าสู่ระบบ
      </Heading>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>ชื่อผู้ใช้</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>รหัสผ่าน</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
            />
          </FormControl>
          
          <Button
            type="submit"
            colorScheme="green"
            width="100%"
            mt={4}
            isLoading={isLoading}
            loadingText="กำลังเข้าสู่ระบบ..."
          >
            เข้าสู่ระบบ
          </Button>
        </VStack>
      </form>
      
      <Text mt={4} textAlign="center" color="gray.600">
        ระบบสำหรับเจ้าหน้าที่ MOPH เท่านั้น
      </Text>
    </Box>
  );
};

export default Login;
