import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Icon } from 'react-native-elements'

// Screens
import HomeScreen from '../pages/home/HomeScreen'
import DashboardScreen from '../pages/dashboard/DashboardScreen'
import { RewardsScreen } from '../pages/rewards/RewardsScreen'
import { DealsScreen } from '../pages/deals/DealsScreen'
import SocialScreen from '../pages/social/SocialScreen'
import {MarketplaceScreen} from '../pages/marketplace/MarketplaceScreen'
import {PartnerDetailsScreen} from '../pages/marketplace/PartnerDetailsScreen'
import { ProductDetailsScreen } from '../pages/marketplace/ProductDetailsScreen'
import ProfileScreen from '../pages/profile/ProfileScreen'
import ReviewsScreen from '../pages/reviews/ReviewsScreen'
import { CreatePartnerScreen } from '../pages/partner/CreatePartnerScreen'
import { PartnerDashboard } from '../pages/partner/PartnerDashboard'
import { ManageRewards } from '../pages/partner/ManageRewards'
import { OrdersScreen } from '../pages/orders/OrdersScreen'
import { PartnerSettings } from '../pages/partner/PartnerSettings'
import { CartScreen } from '../pages/marketplace/CartScreen'
import FriendsActivityScreen from '../pages/social/FriendsActivityScreen'
import { ChangePasswordScreen } from '../pages/profile/ChangePasswordScreen'
import { DeleteAccountScreen } from '../pages/profile/DeleteAccountScreen'
import {InstitutesScreen}  from '../pages/social/InstitutesScreen'
import { DonationsScreen } from '../pages/social/DonationsScreen'
import { PartnerOrdersScreen } from '../pages/partner/PartnerOrdersScreen'
import { QRCodeScreen } from '../pages/orders/QRCodeScreen'
import ScanQRScreen from '../pages/partner/ScanQRScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const MarketplaceStack = () => (
  <Stack.Navigator initialRouteName='MarketplaceMain'>
    <Stack.Screen
      name="MarketplaceMain"
      component={MarketplaceScreen}
      options={{ title: 'Bons Plans' }}
    />
    <Stack.Screen
      name="PartnerDetails"
      component={PartnerDetailsScreen}
      options={({ route }) => ({ title: route.params.partner.company_name })}
    />
    <Stack.Screen
      name="ProductDetails"
      component={ProductDetailsScreen}
      options={({ route }) => ({ title: route.params.product.title })}
    />
    <Stack.Screen
      name="Reviews"
      component={ReviewsScreen}
      options={{ title: 'Avis' }}
    />
  </Stack.Navigator>
)

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ title: 'Profil' }}
    />
    <Stack.Screen
      name="CreatePartner"
      component={CreatePartnerScreen}
      options={{ title: 'Devenir partenaire' }}
    />
    <Stack.Screen
      name="PartnerDashboard"
      component={PartnerDashboard}
      options={{ title: 'Tableau de bord' }}
    />
    <Stack.Screen
      name="ManageRewards"
      component={ManageRewards}
      options={{ title: 'Gérer les récompenses' }}
    />
    <Stack.Screen
      name="Orders"
      component={OrdersScreen}
      options={{ title: 'Commandes' }}
    />
    <Stack.Screen
      name="PartnerSettings"
      component={PartnerSettings}
      options={{ title: 'Paramètres' }}
    />
    <Stack.Screen
      name="Cart"
      component={CartScreen}
      options={{ title: 'Mon panier' }}
    />
    <Stack.Screen
      name="FriendsActivity"
      component={FriendsActivityScreen}
      options={{ title: 'Amis et activités' }}
    />
    <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ title: 'Modifier le mot de passe' }}
    />
    <Stack.Screen
      name="DeleteAccount"
      component={DeleteAccountScreen}
      options={{ title: 'Supprimer le compte' }}
    />
    <Stack.Screen
      name="Institutes"
      component={InstitutesScreen}
      options={{ title: 'Associations' }}
    />
    <Stack.Screen
      name="Donations"
      component={DonationsScreen}
      options={{ title: 'Mes dons' }}
    />
    <Stack.Screen
      name="PartnerOrders"
      component={PartnerOrdersScreen}
      options={{ title: 'Commandes reçues' }}
    />
    <Stack.Screen
      name="QRCode"
      component={QRCodeScreen}
      options={{ title: 'Code QR' }}
    />
    <Stack.Screen
      name="ScanQRCode"
      component={ScanQRScreen}
      options={{ title: 'Scanner QR Code' }}
    />
  </Stack.Navigator>
)

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          switch (route.name) {
            case 'Dashboard':
              iconName = 'home'
              break
            case 'Rewards':
              iconName = 'star'
              break
            case 'Social':
              iconName = 'people'
              break
            case 'Marketplace':
              iconName = 'store'
              break
            case 'Profile':
              iconName = 'person'
              break
            case 'Deals':
              iconName = 'tag'
              break
            case 'Cart':
              iconName = 'circle'
              break
            default:
              iconName = 'circle'
          }

          return (
            <Icon
              name={iconName}
              type="material"
              size={size}
              color={color}
            />
          )
        },
        tabBarActiveTintColor: '#2089dc',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ title: 'Récompenses' }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{ title: 'Social' }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Mon Panier' }}
      />
    </Tab.Navigator>
  )
}
