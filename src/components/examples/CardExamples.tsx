import React from 'react';
import { 
  ModernCard, 
  ModernCardContent, 
  ModernCardIcon, 
  ModernCardTitle, 
  ModernCardDescription, 
  ModernCardFooter 
} from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  Zap, 
  Shield, 
  ArrowRight, 
  Star, 
  Sparkles, 
  Lightbulb, 
  Layers 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CardExamples() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Modern Card Components</h1>
      
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Cards</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <ModernCard>
          <ModernCardIcon>
            <Rocket className="h-8 w-8" />
          </ModernCardIcon>
          <ModernCardTitle>Default Card</ModernCardTitle>
          <ModernCardDescription>
            A clean, minimal card design with subtle shadow and rounded corners.
          </ModernCardDescription>
          <ModernCardFooter>
            <Button variant="outline" size="sm" className="ml-auto">
              Learn More
            </Button>
          </ModernCardFooter>
        </ModernCard>
        
        <ModernCard variant="glass">
          <ModernCardIcon color="purple">
            <Sparkles className="h-8 w-8" />
          </ModernCardIcon>
          <ModernCardTitle>Glass Card</ModernCardTitle>
          <ModernCardDescription>
            A modern glass-morphism effect with backdrop blur and transparency.
          </ModernCardDescription>
          <ModernCardFooter>
            <Button variant="outline" size="sm" className="ml-auto">
              Explore
            </Button>
          </ModernCardFooter>
        </ModernCard>
        
        <ModernCard variant="gradient" color="blue">
          <ModernCardIcon color="blue">
            <Zap className="h-8 w-8" />
          </ModernCardIcon>
          <ModernCardTitle>Gradient Card</ModernCardTitle>
          <ModernCardDescription>
            Subtle gradient background with matching border color.
          </ModernCardDescription>
          <ModernCardFooter>
            <Button variant="outline" size="sm" className="ml-auto">
              Get Started
            </Button>
          </ModernCardFooter>
        </ModernCard>
      </div>
      
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Color Variants</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <ModernCard variant="gradient" color="green" animationDelay={0.1}>
          <ModernCardIcon color="green">
            <Shield className="h-8 w-8" />
          </ModernCardIcon>
          <ModernCardTitle>Green Variant</ModernCardTitle>
          <ModernCardDescription>
            A soothing green gradient perfect for success states or eco-friendly themes.
          </ModernCardDescription>
        </ModernCard>
        
        <ModernCard variant="gradient" color="amber" animationDelay={0.2}>
          <ModernCardIcon color="amber">
            <Lightbulb className="h-8 w-8" />
          </ModernCardIcon>
          <ModernCardTitle>Amber Variant</ModernCardTitle>
          <ModernCardDescription>
            Warm amber tones ideal for highlighting important information.
          </ModernCardDescription>
        </ModernCard>
        
        <ModernCard variant="gradient" color="rose" animationDelay={0.3}>
          <ModernCardIcon color="rose">
            <Star className="h-8 w-8" />
          </ModernCardIcon>
          <ModernCardTitle>Rose Variant</ModernCardTitle>
          <ModernCardDescription>
            Vibrant rose gradient for eye-catching elements and featured content.
          </ModernCardDescription>
        </ModernCard>
      </div>
      
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Special Variants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <ModernCard variant="elevated" animationDelay={0.1}>
          <div className="flex items-start gap-4">
            <ModernCardIcon color="indigo">
              <Layers className="h-8 w-8" />
            </ModernCardIcon>
            <div>
              <ModernCardTitle>Elevated Card</ModernCardTitle>
              <ModernCardDescription>
                A card with enhanced elevation and shadow depth for a more prominent appearance.
              </ModernCardDescription>
              <Button className="mt-4" size="sm">
                <span>Try it now</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </ModernCard>
        
        <ModernCard variant="bordered" color="purple" animationDelay={0.2}>
          <div className="flex items-start gap-4">
            <ModernCardIcon color="purple">
              <Shield className="h-8 w-8" />
            </ModernCardIcon>
            <div>
              <ModernCardTitle>Bordered Card</ModernCardTitle>
              <ModernCardDescription>
                A card with a prominent colored border for visual emphasis and separation.
              </ModernCardDescription>
              <Button className="mt-4" size="sm" variant="outline">
                <span>Learn more</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </ModernCard>
      </div>
      
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Interactive Cards</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: "Hover Effects", 
            description: "This card has enhanced hover animations. Try hovering over it!",
            icon: <Zap className="h-8 w-8" />,
            color: "blue"
          },
          { 
            title: "Micro-interactions", 
            description: "Features subtle animations on interaction for better engagement.",
            icon: <Sparkles className="h-8 w-8" />,
            color: "amber"
          },
          { 
            title: "Responsive Design", 
            description: "Adapts beautifully to different screen sizes and devices.",
            icon: <Layers className="h-8 w-8" />,
            color: "green"
          }
        ].map((card, index) => (
          <ModernCard 
            key={index} 
            className="cursor-pointer" 
            animationDelay={index * 0.1}
            onClick={() => console.log(`Card ${index + 1} clicked`)}
          >
            <ModernCardIcon color={card.color as any}>
              {card.icon}
            </ModernCardIcon>
            <ModernCardTitle>{card.title}</ModernCardTitle>
            <ModernCardDescription>
              {card.description}
            </ModernCardDescription>
            <ModernCardFooter>
              <motion.div 
                className="ml-auto text-blue-600 flex items-center gap-1 text-sm font-medium"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span>Explore</span>
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </ModernCardFooter>
          </ModernCard>
        ))}
      </div>
    </div>
  );
}