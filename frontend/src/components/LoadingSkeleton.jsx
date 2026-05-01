import React from 'react';
import { Skeleton, Card, CardContent, Grid } from '@mui/material';

export const ItemCardSkeleton = () => (
  <Card>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" height={32} />
      <Skeleton variant="text" height={20} />
      <Skeleton variant="text" width="60%" />
    </CardContent>
  </Card>
);

export const LoadingGrid = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {[...Array(count)].map((_, i) => (
      <Grid item xs={12} sm={6} md={4} key={i}>
        <ItemCardSkeleton />
      </Grid>
    ))}
  </Grid>
);