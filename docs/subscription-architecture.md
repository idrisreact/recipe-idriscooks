# Subscription System Architecture & Optimization Guide

## Database Architecture Overview

The subscription system introduces a comprehensive multi-tiered pricing model with the following core components:

### Core Subscription Tables

1. **subscription_plans** - Plan definitions with features and limits
2. **user_subscriptions** - Active user subscription tracking
3. **user_usage** - Monthly usage tracking for limit enforcement
4. **billing_history** - Payment transaction records
5. **subscription_history** - Plan change audit trail
6. **feature_flags** - A/B testing and gradual feature rollouts

### Premium Feature Tables

1. **recipe_collections** - User-created recipe organization
2. **meal_plans** - Weekly meal planning functionality
3. **shopping_lists** - Automated grocery list generation
4. **recipe_nutrition** - Detailed nutritional information
5. **recipe_reviews** - User ratings and reviews
6. **user_preferences** - Enhanced user customization

## Subscription Tiers

### Free Tier
- 10 recipe views per month
- 25 favorites maximum
- Basic search functionality
- No recipe creation or exports

### Premium Tier ($9.99/month, $99.99/year)
- Unlimited recipe access
- Recipe creation and PDF export
- Meal planning and shopping lists
- Nutritional information
- Recipe collections (10 max)
- Custom themes

### Pro Tier ($19.99/month, $199.99/year)
- All Premium features
- Unlimited recipe collections
- Recipe sharing capabilities
- Offline access
- Priority support
- Advanced customization

## Database Optimization Strategies

### 1. Indexing Strategy

#### Primary Performance Indexes
```sql
-- User subscription lookups
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions (user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions (status);

-- Usage tracking
CREATE INDEX idx_user_usage_user_id_month ON user_usage (user_id, year, month);

-- Billing queries
CREATE INDEX idx_billing_history_user_id ON billing_history (user_id);
CREATE INDEX idx_billing_history_billing_date ON billing_history (billing_date);
```

#### Composite Indexes for Complex Queries
```sql
-- Active subscriptions with plan lookup
CREATE INDEX idx_user_subscriptions_active_plan 
ON user_subscriptions (status, plan_id) WHERE status = 'active';

-- Expiring trials
CREATE INDEX idx_user_subscriptions_expiring_trials 
ON user_subscriptions (trial_end, status) 
WHERE status = 'trialing' AND trial_end IS NOT NULL;
```

### 2. Query Optimization

#### Subscription Status Checks
```sql
-- Optimized subscription lookup
SELECT us.*, sp.features, sp.limits 
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = $1 AND us.status = 'active'
LIMIT 1;
```

#### Usage Limit Enforcement
```sql
-- Current month usage check
SELECT * FROM user_usage 
WHERE user_id = $1 
  AND year = EXTRACT(YEAR FROM CURRENT_DATE)
  AND month = EXTRACT(MONTH FROM CURRENT_DATE);
```

### 3. Caching Strategy

#### Application-Level Caching
- Cache user subscription status for 5 minutes
- Cache plan features for 1 hour
- Cache usage data for 1 minute
- Invalidate on subscription changes

#### Database-Level Optimizations
- Use partial indexes for active records
- Implement table partitioning for historical data
- Regular VACUUM and ANALYZE for optimal performance

### 4. Data Archival Strategy

#### Historical Data Management
```sql
-- Archive old billing records (older than 7 years)
CREATE TABLE billing_history_archive AS 
SELECT * FROM billing_history 
WHERE billing_date < CURRENT_DATE - INTERVAL '7 years';

-- Archive subscription changes (older than 2 years)
CREATE TABLE subscription_history_archive AS
SELECT * FROM subscription_history 
WHERE created_at < CURRENT_DATE - INTERVAL '2 years';
```

## Performance Monitoring

### Key Metrics to Track

1. **Subscription Queries**
   - Average response time for subscription lookups
   - Cache hit ratios for plan features
   - Usage tracking query performance

2. **Billing Operations**
   - Payment processing latency
   - Failed payment retry success rates
   - Proration calculation accuracy

3. **Feature Usage**
   - Premium feature adoption rates
   - API call patterns by plan tier
   - Export generation times

### Monitoring Queries

```sql
-- Subscription performance metrics
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as new_subscriptions,
  COUNT(*) FILTER (WHERE status = 'active') as active_subs,
  COUNT(*) FILTER (WHERE status = 'trialing') as trial_subs
FROM user_subscriptions 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at);

-- Usage pattern analysis
SELECT 
  sp.plan_type,
  AVG(uu.api_calls) as avg_api_calls,
  AVG(uu.pdf_exports) as avg_exports,
  AVG(uu.recipes_created) as avg_recipes_created
FROM user_usage uu
JOIN user_subscriptions us ON uu.user_id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE uu.year = EXTRACT(YEAR FROM CURRENT_DATE)
  AND uu.month = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY sp.plan_type;
```

## Security Considerations

### Data Protection
1. **PII Encryption**: Encrypt payment method tokens and sensitive billing data
2. **Access Controls**: Implement row-level security for user data
3. **Audit Logging**: Track all subscription and billing changes
4. **Data Retention**: Automatic purging of expired trial data

### Payment Security
1. **Stripe Integration**: Use Stripe's secure tokenization
2. **Webhook Validation**: Verify all payment webhook signatures
3. **Idempotency**: Ensure billing operations are idempotent
4. **Fraud Detection**: Monitor for unusual subscription patterns

## Scalability Recommendations

### Database Scaling

1. **Read Replicas**: Route subscription lookups to read replicas
2. **Connection Pooling**: Use PgBouncer for connection management
3. **Horizontal Partitioning**: Partition usage data by time periods
4. **Materialized Views**: Pre-compute subscription analytics

### Application Scaling

1. **Microservices**: Consider separating billing into its own service
2. **Event-Driven Architecture**: Use events for subscription state changes
3. **Background Jobs**: Process usage calculations asynchronously
4. **Rate Limiting**: Implement per-plan API rate limiting

## Migration Strategy

### Phase 1: Core Subscription System
1. Deploy new schema with migration `0004_dashing_changeling.sql`
2. Seed initial subscription plans
3. Migrate existing users to free plan
4. Implement basic subscription checking

### Phase 2: Premium Features
1. Enable meal planning and collections
2. Add nutritional information
3. Implement PDF export functionality
4. Deploy recipe sharing features

### Phase 3: Advanced Features
1. Enable offline access for Pro users
2. Implement advanced analytics
3. Add enterprise features
4. Deploy A/B testing framework

### Rollback Plan
1. Feature flags allow instant feature disabling
2. Database migration rollback scripts
3. User data preservation during downgrades
4. Graceful degradation for premium features

## Best Practices

### Development
1. **Feature Flags**: Gate all premium features behind flags
2. **Testing**: Comprehensive test coverage for billing logic
3. **Documentation**: Maintain up-to-date API documentation
4. **Monitoring**: Implement comprehensive logging and metrics

### Operations
1. **Backup Strategy**: Daily backups with point-in-time recovery
2. **Disaster Recovery**: Cross-region backup replication
3. **Capacity Planning**: Monitor growth trends and scale proactively
4. **Security Audits**: Regular penetration testing and code reviews

This architecture provides a robust, scalable foundation for the recipe platform's subscription system while maintaining optimal performance and security.