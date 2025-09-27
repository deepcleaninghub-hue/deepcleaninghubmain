import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Button, List, Switch } from 'react-native-paper';
import { useAdminData } from '@/contexts/AdminDataContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { adminDataService } from '@/services/adminDataService';
import { AdminService } from '@/types';
import { Icon } from '@/components/common/Icon';

export function ServiceDetailsScreen({ route, navigation }: any) {
  const { serviceId } = route.params;
  const { refreshServices } = useAdminData();
  const [service, setService] = useState<AdminService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadServiceDetails();
  }, [serviceId]);

  const loadServiceDetails = async () => {
    try {
      setLoading(true);
      const result = await adminDataService.getService(serviceId);
      if (result.success && result.data) {
        setService(result.data);
      } else {
        setError(result.error || 'Failed to load service details');
      }
    } catch (err) {
      setError('An error occurred while loading service details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = () => {
    navigation.navigate('ServiceEdit', { serviceId });
  };

  const getPricingText = () => {
    if (!service) return '';
    switch (service.pricingType) {
      case 'fixed':
        return `$${service.price?.toFixed(2)}`;
      case 'per_unit':
        return `$${service.unitPrice?.toFixed(2)}/${service.unitMeasure || 'unit'}`;
      case 'hourly':
        return `$${service.price?.toFixed(2)}/hour`;
      default:
        return 'Contact for pricing';
    }
  };

  const getDifficultyColor = (level: AdminService['difficultyLevel']) => {
    switch (level) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#FF5722';
      case 'expert':
        return '#E91E63';
      default:
        return '#757575';
    }
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    while (stars.length < 5) {
      stars.push('☆');
    }
    return stars.join('');
  };

  if (loading) {
    return <LoadingSpinner loading={true} message="Loading service details..." />;
  }

  if (error || !service) {
    return (
      <ErrorDisplay 
        error={error || 'Service not found'} 
        onRetry={loadServiceDetails}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Service Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.serviceInfo}>
                <Text variant="headlineSmall" style={styles.serviceTitle}>
                  {service.title}
                </Text>
                <Text variant="bodyMedium" style={styles.category}>
                  {service.category}
                </Text>
                <Text variant="bodyMedium" style={styles.description}>
                  {service.description}
                </Text>
              </View>
              
              <View style={styles.statusContainer}>
                <Chip
                  mode={service.isActive ? 'flat' : 'outlined'}
                  textStyle={{ fontSize: 12, fontWeight: 'bold' }}
                  style={[
                    styles.statusChip,
                    { 
                      backgroundColor: service.isActive ? '#4CAF50' : 'transparent',
                      borderColor: service.isActive ? '#4CAF50' : '#BDBDBD'
                    }
                  ]}
                >
                  {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Chip>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={handleEditService}
                icon="edit"
                style={styles.actionButton}
              >
                Edit Service
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Service Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Service Statistics
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {service.totalBookings}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Total Bookings
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={[styles.statValue, { color: '#4CAF50' }]}>
                  ${service.totalRevenue.toFixed(0)}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Total Revenue
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {service.averageRating.toFixed(1)}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Average Rating
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={[styles.statValue, { color: '#2196F3' }]}>
                  {service.popularityScore}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Popularity Score
                </Text>
              </View>
            </View>
            
            <View style={styles.ratingContainer}>
              <Text variant="bodyMedium" style={styles.ratingText}>
                {getRatingStars(service.averageRating)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Pricing Information */}
        <Card style={styles.pricingCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Pricing Information
            </Text>
            
            <List.Item
              title="Pricing Type"
              description={service.pricingType.replace('_', ' ').toUpperCase()}
              left={(props) => <List.Icon {...props} icon="currency-usd" />}
            />
            
            <List.Item
              title="Price"
              description={getPricingText()}
              left={(props) => <List.Icon {...props} icon="cash" />}
            />
            
            {service.unitPrice && (
              <List.Item
                title="Unit Price"
                description={`$${service.unitPrice.toFixed(2)} per ${service.unitMeasure || 'unit'}`}
                left={(props) => <List.Icon {...props} icon="scale" />}
              />
            )}
            
            {service.minMeasurement && (
              <List.Item
                title="Minimum Measurement"
                description={`${service.minMeasurement} ${service.unitMeasure || 'units'}`}
                left={(props) => <List.Icon {...props} icon="arrow-down" />}
              />
            )}
            
            {service.maxMeasurement && (
              <List.Item
                title="Maximum Measurement"
                description={`${service.maxMeasurement} ${service.unitMeasure || 'units'}`}
                left={(props) => <List.Icon {...props} icon="arrow-up" />}
              />
            )}
            
            {service.duration && (
              <List.Item
                title="Duration"
                description={service.duration}
                left={(props) => <List.Icon {...props} icon="clock" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Service Details */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Service Details
            </Text>
            
            <List.Item
              title="Difficulty Level"
              description={service.difficultyLevel.toUpperCase()}
              left={(props) => <List.Icon {...props} icon="star" />}
              right={() => (
                <Chip
                  mode="outlined"
                  textStyle={{ fontSize: 10 }}
                  style={[styles.difficultyChip, { borderColor: getDifficultyColor(service.difficultyLevel) }]}
                >
                  {service.difficultyLevel.toUpperCase()}
                </Chip>
              )}
            />
            
            <List.Item
              title="Estimated Duration"
              description={`${service.estimatedDuration} minutes`}
              left={(props) => <List.Icon {...props} icon="timer" />}
            />
            
            <List.Item
              title="Display Order"
              description={service.displayOrder.toString()}
              left={(props) => <List.Icon {...props} icon="sort" />}
            />
          </Card.Content>
        </Card>

        {/* Features */}
        {service.features.length > 0 && (
          <Card style={styles.featuresCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Features ({service.features.length})
              </Text>
              
              <View style={styles.featuresList}>
                {service.features.map((feature, index) => (
                  <List.Item
                    key={index}
                    title={feature}
                    left={(props) => <List.Icon {...props} icon="check" />}
                    style={styles.featureItem}
                  />
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Equipment & Supplies */}
        {(service.equipmentNeeded.length > 0 || service.suppliesNeeded.length > 0) && (
          <Card style={styles.equipmentCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Equipment & Supplies
              </Text>
              
              {service.equipmentNeeded.length > 0 && (
                <View style={styles.equipmentSection}>
                  <Text variant="bodyLarge" style={styles.equipmentTitle}>
                    Equipment Needed:
                  </Text>
                  <View style={styles.equipmentList}>
                    {service.equipmentNeeded.map((equipment, index) => (
                      <Chip
                        key={index}
                        mode="outlined"
                        textStyle={{ fontSize: 12 }}
                        style={styles.equipmentChip}
                        icon="build"
                      >
                        {equipment}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
              
              {service.suppliesNeeded.length > 0 && (
                <View style={styles.equipmentSection}>
                  <Text variant="bodyLarge" style={styles.equipmentTitle}>
                    Supplies Needed:
                  </Text>
                  <View style={styles.equipmentList}>
                    {service.suppliesNeeded.map((supply, index) => (
                      <Chip
                        key={index}
                        mode="outlined"
                        textStyle={{ fontSize: 12 }}
                        style={styles.equipmentChip}
                        icon="inventory"
                      >
                        {supply}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Staff Requirements */}
        {service.staffRequirements.length > 0 && (
          <Card style={styles.staffCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Staff Requirements
              </Text>
              
              {service.staffRequirements.map((requirement, index) => (
                <List.Item
                  key={index}
                  title={requirement.role}
                  description={`${requirement.minCount}-${requirement.maxCount} staff members`}
                  left={(props) => <List.Icon {...props} icon="account-group" />}
                  right={() => (
                    <View style={styles.skillsContainer}>
                      {requirement.skills.slice(0, 2).map((skill, skillIndex) => (
                        <Chip
                          key={skillIndex}
                          mode="outlined"
                          textStyle={{ fontSize: 10 }}
                          style={styles.skillChip}
                        >
                          {skill}
                        </Chip>
                      ))}
                      {requirement.skills.length > 2 && (
                        <Text variant="bodySmall" style={styles.moreSkills}>
                          +{requirement.skills.length - 2} more
                        </Text>
                      )}
                    </View>
                  )}
                  style={styles.requirementItem}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Service Variants */}
        {service.serviceVariants.length > 0 && (
          <Card style={styles.variantsCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Service Variants ({service.serviceVariants.length})
              </Text>
              
              {service.serviceVariants.map((variant, index) => (
                <List.Item
                  key={variant.id}
                  title={variant.title}
                  description={`$${variant.price.toFixed(2)} - ${variant.duration || 'No duration specified'}`}
                  left={(props) => <List.Icon {...props} icon="tune" />}
                  right={() => (
                    <Chip
                      mode={variant.isActive ? 'flat' : 'outlined'}
                      textStyle={{ fontSize: 10 }}
                      style={[
                        styles.variantChip,
                        { 
                          backgroundColor: variant.isActive ? '#4CAF50' : 'transparent',
                          borderColor: variant.isActive ? '#4CAF50' : '#BDBDBD'
                        }
                      ]}
                    >
                      {variant.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Chip>
                  )}
                  style={styles.variantItem}
                />
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  category: {
    color: '#757575',
    marginBottom: 8,
    fontWeight: '500',
  },
  description: {
    color: '#757575',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#212121',
  },
  statLabel: {
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingText: {
    color: '#FF9800',
    fontSize: 20,
  },
  pricingCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  difficultyChip: {
    marginLeft: 8,
  },
  featuresCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  featuresList: {
    // Additional styles if needed
  },
  featureItem: {
    paddingVertical: 4,
  },
  equipmentCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  equipmentSection: {
    marginBottom: 16,
  },
  equipmentTitle: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  staffCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  skillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  moreSkills: {
    color: '#757575',
    fontStyle: 'italic',
  },
  requirementItem: {
    paddingVertical: 4,
  },
  variantsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  variantItem: {
    paddingVertical: 4,
  },
  variantChip: {
    marginLeft: 8,
  },
});
