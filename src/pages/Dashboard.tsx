import { Box, SimpleGrid, Card, CardHeader, CardBody, Text, Heading, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Sample data - replace with actual data from your API
  const stats = [
    { title: 'ผู้ใช้งานทั้งหมด', value: '1,234' },
    { title: 'รายการแจ้งซ่อม', value: '56' },
    { title: 'รายการเสร็จสิ้น', value: '1,178' },
    { title: 'กำลังดำเนินการ', value: '12' },
  ];

  return (
    <Box>
      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4}>
          ภาพรวมระบบ
        </Heading>
        <Text color="gray.600">ยินดีต้อนรับเข้าสู่ระบบจัดการ MOPH Portal</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {stats.map((stat, index) => (
          <Card key={index} bg="white" borderRadius="md" boxShadow="sm">
            <CardHeader pb={0}>
              <Text fontSize="sm" color="gray.500">
                {stat.title}
              </Text>
            </CardHeader>
            <CardBody>
              <Heading size="xl">{stat.value}</Heading>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card bg="white" borderRadius="md" boxShadow="sm" mb={8}>
        <CardHeader borderBottom="1px" borderColor="gray.100">
          <Heading size="md">เมนูหลัก</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            <Button 
              colorScheme="green" 
              variant="outline" 
              height="120px"
              onClick={() => navigate('/reports')}
            >
              ระบบรายงาน
            </Button>
            <Button 
              colorScheme="blue" 
              variant="outline" 
              height="120px"
              onClick={() => navigate('/users')}
            >
              จัดการผู้ใช้
            </Button>
            <Button 
              colorScheme="purple" 
              variant="outline" 
              height="120px"
              onClick={() => navigate('/settings')}
            >
              ตั้งค่าระบบ
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>

      <Card bg="white" borderRadius="md" boxShadow="sm">
        <CardHeader borderBottom="1px" borderColor="gray.100">
          <Heading size="md">กิจกรรมล่าสุด</Heading>
        </CardHeader>
        <CardBody>
          <Text color="gray.600" textAlign="center" py={4}>
            ไม่มีกิจกรรมล่าสุด
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
