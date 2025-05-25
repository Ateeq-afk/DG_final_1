import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Plan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  features: Record<string, boolean>;
  limits: Record<string, number>;
  is_active: boolean;
}

interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_start?: string;
  trial_end?: string;
  plan?: Plan;
}

export function useSubscription(organizationId: string | null) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (organizationId) {
      loadSubscription();
    }
  }, [organizationId]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load available plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (plansError) throw plansError;
      setPlans(plansData);

      // Load current subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('organization_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('organization_id', organizationId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no subscription case

      if (subscriptionError) throw subscriptionError;

      // If no subscription exists, create a free plan subscription
      if (!subscriptionData) {
        const freePlan = plansData.find(p => p.code === 'free');
        if (!freePlan) throw new Error('Free plan not found');

        const { data: newSubscription, error: createError } = await supabase
          .from('organization_subscriptions')
          .insert({
            organization_id: organizationId,
            plan_id: freePlan.id,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false
          })
          .select(`
            *,
            plan:subscription_plans(*)
          `)
          .single();

        if (createError) throw createError;
        setSubscription(newSubscription);
      } else {
        setSubscription(subscriptionData);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to load subscription'));
    } finally {
      setLoading(false);
    }
  };

  const upgradePlan = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would:
      // 1. Create a Stripe checkout session
      // 2. Redirect to Stripe checkout
      // 3. Handle webhook for successful payment
      // 4. Update subscription status

      const { data, error } = await supabase
        .from('organization_subscriptions')
        .upsert({
          organization_id: organizationId,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false
        })
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (error) throw error;
      setSubscription(data);
      return data;
    } catch (err) {
      console.error('Failed to upgrade plan:', err);
      throw err instanceof Error ? err : new Error('Failed to upgrade plan');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would:
      // 1. Cancel the subscription in Stripe
      // 2. Update local subscription status

      const { data, error } = await supabase
        .from('organization_subscriptions')
        .update({
          cancel_at_period_end: true
        })
        .eq('organization_id', organizationId)
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      throw err instanceof Error ? err : new Error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = async (limitName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('check_subscription_limit', {
          org_id: organizationId,
          limit_name: limitName
        });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to check limit:', err);
      return false;
    }
  };

  const incrementUsage = async (usageType: string, increment: number = 1) => {
    try {
      const { error } = await supabase
        .rpc('increment_usage', {
          org_id: organizationId,
          usage_type: usageType,
          increment
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to increment usage:', err);
    }
  };

  return {
    subscription,
    plans,
    loading,
    error,
    upgradePlan,
    cancelSubscription,
    checkLimit,
    incrementUsage,
    refresh: loadSubscription
  };
}