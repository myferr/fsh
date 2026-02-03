#!/bin/bash

set -e

IMAGE_NAME=${1:-backend}
TAG=${2:-latest}
REGISTRY=${3:-docker.io}


echo "Building Docker image..."
docker build -t "${IMAGE_NAME}:${TAG}" .

echo "Tagging image..."
docker tag "${IMAGE_NAME}:${TAG}" "${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "Pushing image to registry..."
docker push "${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "Successfully published ${REGISTRY}/${IMAGE_NAME}:${TAG}"